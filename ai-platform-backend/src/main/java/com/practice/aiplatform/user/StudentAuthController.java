// Force Update
package com.practice.aiplatform.user;

import com.practice.aiplatform.notifications.NotificationService;
import com.practice.aiplatform.security.JwtUtil;
import com.practice.aiplatform.user.GoogleAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin // Fixes CORS issues
public class StudentAuthController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;

    private final GoogleAuthService googleAuthService;

    @Autowired
    public StudentAuthController(StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            NotificationService notificationService,
            GoogleAuthService googleAuthService) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.notificationService = notificationService;
        this.googleAuthService = googleAuthService;
    }

    // --- 1. REGISTER ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (studentRepository.findByEmail(req.email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
        }

        Student student = new Student();
        student.setEmail(req.email);
        student.setPassword(passwordEncoder.encode(req.password));
        student.setFirstName(req.firstName);
        student.setLastName(req.lastName);

        // Set defaults
        student.setFreeActionsUsed(0);
        student.setSubscriptionStatus("FREE");

        Student savedStudent = studentRepository.save(student);

        // Notify
        try {
            notificationService.notify(savedStudent.getId(), "REGISTER", "Welcome! Registration successful.");
        } catch (Exception e) {
            System.out.println("Notification failed: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    // --- 2. LOGIN (with Streak Logic + DTO Response) ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<Student> studentOpt = studentRepository.findByEmail(req.email);

        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            if (passwordEncoder.matches(req.password, student.getPassword())) {

                // --- Streak Logic ---
                LocalDate today = LocalDate.now();
                if (student.getLastLoginDate() != null) {
                    long daysBetween = ChronoUnit.DAYS.between(student.getLastLoginDate(), today);
                    if (daysBetween == 1) {
                        student.setStreakDays(student.getStreakDays() + 1);
                    } else if (daysBetween > 1) {
                        student.setStreakDays(1); // Reset streak
                    }
                    // daysBetween == 0 means same day login, keep streak unchanged
                } else {
                    student.setStreakDays(1); // First login
                }
                student.setLastLoginDate(today);
                studentRepository.save(student);

                // Generate Token
                String token = jwtUtil.generateToken(student);

                // Notify
                try {
                    notificationService.notify(student.getId(), "LOGIN", "New login detected.");
                } catch (Exception e) {
                    // Ignore notification errors during login
                }

                // Return DTO (not raw entity) to prevent serialization issues
                StudentDto dto = new StudentDto(
                        student.getId(),
                        student.getEmail(),
                        student.getFirstName(),
                        student.getLastName(),
                        student.getGender(),
                        token,
                        student.getSubscriptionStatus(),
                        student.getFreeActionsUsed(),
                        student.getTotalXp(),
                        student.getStreakDays());

                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("student", dto);
                response.put("message", "Login successful");

                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
    }

    // --- 3. GOOGLE LOGIN (DTO Response) ---

    @PostMapping("/oauth/google")
    public ResponseEntity<?> handleGoogleLogin(@RequestBody Map<String, String> request) {

        try {
            String idToken = request.get("token");

            var payload = googleAuthService.verifyToken(idToken);

            if (payload == null) {
                return ResponseEntity.status(401).body("Invalid Google token");
            }

            String email = payload.getEmail();

            Optional<Student> existing = studentRepository.findByEmail(email);

            Student student;

            if (existing.isPresent()) {
                student = existing.get();
            } else {
                student = new Student();
                student.setEmail(email);
                student.setFirstName((String) payload.get("given_name"));
                student.setLastName((String) payload.get("family_name"));
                student.setPassword(""); // no password for Google users
                student.setSubscriptionStatus("FREE");
                student.setFreeActionsUsed(0);

                studentRepository.save(student);
            }

            // Streak logic for Google login too
            LocalDate today = LocalDate.now();
            if (student.getLastLoginDate() != null) {
                long daysBetween = ChronoUnit.DAYS.between(student.getLastLoginDate(), today);
                if (daysBetween == 1) {
                    student.setStreakDays(student.getStreakDays() + 1);
                } else if (daysBetween > 1) {
                    student.setStreakDays(1);
                }
            } else {
                student.setStreakDays(1);
            }
            student.setLastLoginDate(today);
            studentRepository.save(student);

            String jwt = jwtUtil.generateToken(student);

            // Return DTO instead of raw entity
            StudentDto dto = new StudentDto(
                    student.getId(),
                    student.getEmail(),
                    student.getFirstName(),
                    student.getLastName(),
                    student.getGender(),
                    jwt,
                    student.getSubscriptionStatus(),
                    student.getFreeActionsUsed(),
                    student.getTotalXp(),
                    student.getStreakDays());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "LOGIN_SUCCESS");
            response.put("token", jwt);
            response.put("student", dto);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Google Auth Failed");
        }
    }

    // --- INNER CLASSES (DTOs) ---
    // Using static inner classes ensures you don't need extra files
    static class RegisterRequest {
        public String firstName;
        public String lastName;
        public String email;
        public String password;
    }

    static class LoginRequest {
        public String email;
        public String password;
    }
}