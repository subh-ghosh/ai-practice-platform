package com.practice.aiplatform.user;

import com.practice.aiplatform.security.JwtUtil;
import com.practice.aiplatform.notifications.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentAuthController {

    private final NotificationService notificationService;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public StudentAuthController(
            NotificationService notificationService,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.notificationService = notificationService;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.email() == null || req.password() == null ||
                req.firstName() == null || req.lastName() == null) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }
        if (studentRepository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists.");
        }

        Student student = new Student(
                req.email().trim(),
                passwordEncoder.encode(req.password()),
                req.firstName().trim(),
                req.lastName().trim()
        );
        studentRepository.save(student);

        // notify register
        notificationService.notify(student.getId(), "REGISTER", "Welcome, you have registered successfully.");

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Student student = studentRepository.findByEmail(req.email()).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }

        boolean ok = passwordEncoder.matches(req.password(), student.getPassword());
        // plaintext migration path
        if (!ok && req.password().equals(student.getPassword())) {
            student.setPassword(passwordEncoder.encode(req.password()));
            studentRepository.save(student);
            ok = true;
        }

        if (!ok) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }

        String token = jwtUtil.generateToken(student);
        StudentDto dto = new StudentDto(
                student.getId(),
                student.getEmail(),
                student.getFirstName(),
                student.getLastName(),
                student.getGender(),
                token
        );

        // notify login
        notificationService.notify(student.getId(), "LOGIN", "You logged in successfully.");

        return ResponseEntity.ok(dto);
    }
}
