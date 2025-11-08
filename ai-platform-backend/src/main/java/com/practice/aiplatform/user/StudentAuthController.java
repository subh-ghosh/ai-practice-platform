package com.practice.aiplatform.user;

import com.practice.aiplatform.security.JwtUtil;
import com.practice.aiplatform.notifications.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

// --- Add required imports ---
import org.springframework.beans.factory.annotation.Autowired;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import java.io.IOException;
import java.security.GeneralSecurityException;
// --- End imports ---

@RestController
@RequestMapping("/api/students")
public class StudentAuthController {

    private final NotificationService notificationService;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleAuthService googleAuthService; // 👈 --- ADD THIS

    @Autowired // 👈 --- ADD THIS
    public StudentAuthController(
            NotificationService notificationService,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            GoogleAuthService googleAuthService // 👈 --- ADD THIS
    ) {
        this.notificationService = notificationService;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.googleAuthService = googleAuthService; // 👈 --- ADD THIS
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
                token,
                student.getSubscriptionStatus(), // 👈 --- ADD THIS
                student.getFreeActionsUsed()      // 👈 --- ADD THIS
        );

        // notify login
        notificationService.notify(student.getId(), "LOGIN", "You logged in successfully.");

        return ResponseEntity.ok(dto);
    }

    // 👇 --- ADD THIS NEW ENDPOINT ---
    @PostMapping("/oauth/google")
    public ResponseEntity<?> handleGoogleLogin(@RequestBody GoogleTokenRequest request) {
        try {
            GoogleIdToken.Payload payload = googleAuthService.verifyToken(request.idToken());
            if (payload == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google Token");
            }

            String email = payload.getEmail();
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");

            // Check if user already exists
            var studentOpt = studentRepository.findByEmail(email);

            if (studentOpt.isPresent()) {
                // --- CASE 1: USER EXISTS ---
                // User exists, log them in and issue a JWT
                Student student = studentOpt.get();
                String token = jwtUtil.generateToken(student);
                StudentDto dto = new StudentDto(
                        student.getId(),
                        student.getEmail(),
                        student.getFirstName(),
                        student.getLastName(),
                        student.getGender(),
                        token,
                        student.getSubscriptionStatus(), // 👈 --- ADD THIS
                        student.getFreeActionsUsed()      // 👈 --- ADD THIS
                );

                // Send a login notification
                notificationService.notify(student.getId(), "LOGIN", "You logged in successfully with Google.");

                return ResponseEntity.ok(new GoogleAuthResponse("LOGIN_SUCCESS", dto, token, null, null, null));

            } else {
                // --- CASE 2: NEW USER ---
                // User is new, signal frontend to start registration
                return ResponseEntity.ok(new GoogleAuthResponse("NEEDS_REGISTRATION", null, null, email, firstName, lastName));
            }

        } catch (GeneralSecurityException | IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Token verification failed");
        }
    }
}