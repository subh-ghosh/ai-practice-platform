package com.practice.aiplatform.user;

import com.practice.aiplatform.notifications.NotificationService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

record ProfileUpdateRequest(
        String firstName,
        String lastName,
        String gender,
        String bio,
        String headline,
        String avatarUrl,
        String githubUrl,
        String linkedinUrl,
        String websiteUrl) {
}

record ChangePasswordRequest(String oldPassword, String newPassword) {
}

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public StudentController(
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            NotificationService notificationService) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @GetMapping("/profile")
    @Cacheable(value = "UserProfileCache", key = "#principal.name", sync = true)
    public ResponseEntity<?> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return ResponseEntity.ok(StudentResponseDTO.fromEntity(student));
    }

    @PutMapping("/profile")
    @Caching(evict = {
            @CacheEvict(value = "UserProfileCache", key = "#principal.name"),
            @CacheEvict(value = "LeaderboardCache", allEntries = true)
    })
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest req, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (req.firstName() != null) student.setFirstName(req.firstName().trim());
        if (req.lastName() != null) student.setLastName(req.lastName().trim());
        if (req.gender() != null) student.setGender(req.gender().trim().toLowerCase());
        if (req.bio() != null) student.setBio(req.bio().trim());
        if (req.headline() != null) student.setHeadline(req.headline().trim());
        if (req.avatarUrl() != null) student.setAvatarUrl(req.avatarUrl().trim());
        if (req.githubUrl() != null) student.setGithubUrl(req.githubUrl().trim());
        if (req.linkedinUrl() != null) student.setLinkedinUrl(req.linkedinUrl().trim());
        if (req.websiteUrl() != null) student.setWebsiteUrl(req.websiteUrl().trim());

        studentRepository.save(student);

        notificationService.createNotification(student.getId(), "PROFILE_UPDATED", "Your profile was updated.");

        return ResponseEntity.ok(StudentResponseDTO.fromEntity(student));
    }

    @PutMapping("/password")
    @Caching(evict = {
            @CacheEvict(value = "UserProfileCache", key = "#principal.name"),
            @CacheEvict(value = "UserUsageRemainingCache", key = "#principal.name")
    })
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest req, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (req.oldPassword() == null || req.newPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Old and new passwords are required.");
        }

        boolean matches = passwordEncoder.matches(req.oldPassword(), student.getPassword());
        if (!matches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Old password is incorrect.");
        }

        student.setPassword(passwordEncoder.encode(req.newPassword()));
        studentRepository.save(student);

        return ResponseEntity.ok("Password changed successfully.");
    }

    @DeleteMapping("/account")
    @Caching(evict = {
            @CacheEvict(value = "UserProfileCache", key = "#principal.name"),
            @CacheEvict(value = "LeaderboardCache", allEntries = true),
            @CacheEvict(value = "UserUsageRemainingCache", key = "#principal.name")
    })
    public ResponseEntity<?> deleteAccount(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        studentRepository.delete(student);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/leaderboard")
    @Cacheable(value = "LeaderboardCache", key = "'top10'", sync = true)
    public ResponseEntity<List<StudentResponseDTO>> getLeaderboard() {
        List<Student> topStudents = studentRepository.findTop10ByOrderByTotalXpDesc();

        List<StudentResponseDTO> dtos = new ArrayList<>();
        for (Student student : topStudents) {
            dtos.add(StudentResponseDTO.fromEntity(student));
        }

        return ResponseEntity.ok(dtos);
    }
}
