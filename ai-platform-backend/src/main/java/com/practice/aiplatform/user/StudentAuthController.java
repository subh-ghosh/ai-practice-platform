package com.practice.aiplatform.user;

import com.practice.aiplatform.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

record RegisterRequest(String firstName, String lastName, String email, String password) {}
// you already have: record LoginRequest(String email, String password) {}

@RestController
@RequestMapping("/api/students")
public class StudentAuthController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public StudentAuthController(StudentRepository studentRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtUtil jwtUtil) {
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
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Student student = studentRepository.findByEmail(req.email()).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }

        boolean ok = passwordEncoder.matches(req.password(), student.getPassword());
        // MIGRATION PATH: if DB still has plaintext for older users, accept once and re-hash
        if (!ok && req.password().equals(student.getPassword())) {
            student.setPassword(passwordEncoder.encode(req.password())); // upgrade to hash
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
        return ResponseEntity.ok(dto);
    }
}
