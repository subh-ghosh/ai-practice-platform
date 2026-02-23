package com.practice.aiplatform.user;

import com.practice.aiplatform.notifications.NotificationService;
import com.practice.aiplatform.security.JwtUtil;
import com.practice.aiplatform.security.RefreshToken;
import com.practice.aiplatform.security.RefreshTokenService;
import com.practice.aiplatform.security.TokenRefreshException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
@CrossOrigin
public class StudentAuthController {

    private static final Logger log = LoggerFactory.getLogger(StudentAuthController.class);

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;
    private final GoogleAuthService googleAuthService;
    private final RefreshTokenService refreshTokenService;

    public StudentAuthController(
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            NotificationService notificationService,
            GoogleAuthService googleAuthService,
            RefreshTokenService refreshTokenService) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.notificationService = notificationService;
        this.googleAuthService = googleAuthService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid request body"));
        }

        String email = normalizeEmail(req.email());
        String firstName = normalizeName(req.firstName(), "Student");
        String lastName = normalizeName(req.lastName(), "");
        String password = req.password();

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email and password are required"));
        }

        try {
            if (studentRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
            }

            Student student = new Student();
            student.setEmail(email);
            student.setPassword(passwordEncoder.encode(password));
            student.setFirstName(firstName);
            student.setLastName(lastName);
            student.setFreeActionsUsed(0);
            student.setSubscriptionStatus("FREE");
            student.setTotalXp(0);
            student.setStreakDays(1);

            Student savedStudent = studentRepository.save(student);

            try {
                notificationService.createNotification(savedStudent.getId(), "REGISTER", "Welcome! Registration successful.");
            } catch (Exception ignored) {
            }

            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception ex) {
            log.error("Register failed for email {}: {}", email, ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed. Please try again."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid request body"));
        }

        String email = normalizeEmail(req.email());
        if (email == null || email.isBlank() || req.password() == null || req.password().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email and password are required"));
        }

        Optional<Student> studentOpt;
        try {
            studentOpt = studentRepository.findByEmail(email);
        } catch (Exception ex) {
            log.error("Login pre-check failed for email {}: {}", email, ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed. Please try again."));
        }

        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }

        try {
            Student student = studentOpt.get();
            if (!passwordEncoder.matches(req.password(), student.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
            }

            updateStreak(student);
            studentRepository.save(student);

            String token = jwtUtil.generateToken(student);

            refreshTokenService.deleteByUserId(student.getId());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(student.getId());

            try {
                notificationService.createNotification(student.getId(), "LOGIN", "New login detected.");
            } catch (Exception ignored) {
            }

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
                    student.getStreakDays(),
                    refreshToken.getToken());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("refreshToken", refreshToken.getToken());
            response.put("student", dto);
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Login failed for email {}: {}", email, ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed. Please try again."));
        }
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<?> handleGoogleLogin(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("token");
            var payload = googleAuthService.verifyToken(idToken);

            if (payload == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google token");
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
                student.setPassword("");
                student.setSubscriptionStatus("FREE");
                student.setFreeActionsUsed(0);
                studentRepository.save(student);
            }

            updateStreak(student);
            studentRepository.save(student);

            String jwt = jwtUtil.generateToken(student);

            refreshTokenService.deleteByUserId(student.getId());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(student.getId());

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
                    student.getStreakDays(),
                    refreshToken.getToken());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "LOGIN_SUCCESS");
            response.put("token", jwt);
            response.put("refreshToken", refreshToken.getToken());
            response.put("student", dto);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Google Auth Failed");
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        String requestRefreshToken = request.refreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getStudent)
                .map(student -> {
                    String token = jwtUtil.generateToken(student);
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new TokenRefreshException(
                        requestRefreshToken,
                        "Refresh token is not in database!"
                ));
    }

    private void updateStreak(Student student) {
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
    }

    public record RefreshTokenRequest(String refreshToken) {
    }

    public record TokenRefreshResponse(String accessToken, String refreshToken, String tokenType) {
        public TokenRefreshResponse(String accessToken, String refreshToken) {
            this(accessToken, refreshToken, "Bearer");
        }
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private String normalizeName(String value, String fallback) {
        if (value == null) {
            return fallback;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? fallback : normalized;
    }
}
