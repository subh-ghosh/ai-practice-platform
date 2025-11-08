package com.practice.aiplatform.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.practice.aiplatform.notifications.NotificationService;

import java.security.Principal;

record ProfileUpdateRequest(String firstName, String lastName, String gender) {}
record ChangePasswordRequest(String oldPassword, String newPassword) {}

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public StudentController(
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            NotificationService notificationService
    ) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            Principal principal,
            @RequestHeader(value = "Authorization", required = false) String auth
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        String token = extractBearer(auth);
        return ResponseEntity.ok(toDto(student, token)); // This now calls the updated toDto
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileUpdateRequest req,
            Principal principal,
            @RequestHeader(value = "Authorization", required = false) String auth
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (req.firstName() != null) student.setFirstName(req.firstName().trim());
        if (req.lastName() != null)  student.setLastName(req.lastName().trim());
        if (req.gender() != null)    student.setGender(req.gender().trim().toLowerCase());

        studentRepository.save(student);

        // 🔔 notify on profile update
        notificationService.notify(student.getId(), "PROFILE_UPDATED", "Your profile was updated.");

        String token = extractBearer(auth);
        return ResponseEntity.ok(toDto(student, token)); // This also calls the updated toDto
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest req,
            Principal principal
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (req.oldPassword() == null || req.newPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Old and new passwords are required.");
        }

        boolean matches = passwordEncoder.matches(req.oldPassword(), student.getPassword());
        // legacy plaintext migration
        if (!matches && req.oldPassword().equals(student.getPassword())) {
            matches = true;
        }

        if (!matches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Old password is incorrect.");
        }

        student.setPassword(passwordEncoder.encode(req.newPassword()));
        studentRepository.save(student);
        return ResponseEntity.ok("Password changed successfully.");
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        studentRepository.delete(student);
        return ResponseEntity.noContent().build();
    }

    // --- 👇 THIS METHOD IS UPDATED ---
    private static StudentDto toDto(Student s, String token) {
        return new StudentDto(
                s.getId(),
                s.getEmail(),
                s.getFirstName(),
                s.getLastName(),
                s.getGender(),
                token,
                s.getSubscriptionStatus(),
                s.getFreeActionsUsed()
        );
    }
    // --- 👆 END OF UPDATE ---

    private static String extractBearer(String header) {
        if (header != null && header.startsWith("Bearer ")) return header.substring(7);
        return null;
    }
}