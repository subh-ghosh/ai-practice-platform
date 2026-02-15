package com.practice.aiplatform.gamification;

import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    private final BadgeService badgeService;
    private final StudentRepository studentRepository;

    public GamificationController(BadgeService badgeService, StudentRepository studentRepository) {
        this.badgeService = badgeService;
        this.studentRepository = studentRepository;
    }

    public record BadgeResponse(String code, String displayName, String description, String icon, boolean earned) {
    }

    @GetMapping("/badges")
    public ResponseEntity<List<BadgeResponse>> getMyBadges(Principal principal) {
        String email = principal.getName();
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<UserBadge> earnedBadges = badgeService.getUserBadges(student.getId());
        List<String> earnedCodes = earnedBadges.stream()
                .map(ub -> ub.getBadge().name())
                .collect(Collectors.toList());

        // Return all possible badges, marking earned ones
        List<BadgeResponse> response = List.of(Badge.values()).stream()
                .map(b -> new BadgeResponse(
                        b.name(),
                        b.getDisplayName(),
                        b.getDescription(),
                        b.getIcon(),
                        earnedCodes.contains(b.name())))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
