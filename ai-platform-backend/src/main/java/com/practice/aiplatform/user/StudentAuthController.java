package com.practice.aiplatform.user;

import com.practice.aiplatform.notifications.NotificationService;
import com.practice.aiplatform.security.JwtUtil;
import com.practice.aiplatform.security.RefreshToken;
import com.practice.aiplatform.security.RefreshTokenService;
import com.practice.aiplatform.security.TokenRefreshException;
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
        if (studentRepository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
        }

        Student student = new Student();
        student.setEmail(req.email());
        student.setPassword(passwordEncoder.encode(req.password()));
        student.setFirstName(req.firstName());
        student.setLastName(req.lastName());
        student.setFreeActionsUsed(0);
        student.setSubscriptionStatus("FREE");

        Student savedStudent = studentRepository.save(student);

        try {
            notificationService.createNotification(savedStudent.getId(), "REGISTER", "Welcome! Registration successful.");
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<Student> studentOpt = studentRepository.findByEmail(req.email());

        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }

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
}