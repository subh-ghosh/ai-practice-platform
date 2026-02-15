package com.practice.aiplatform.gamification;

import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

        private final BadgeService badgeService;
        private final StudentRepository studentRepository;
        private final DailyChallengeService dailyChallengeService;

        public GamificationController(BadgeService badgeService, StudentRepository studentRepository,
                        DailyChallengeService dailyChallengeService) {
                this.badgeService = badgeService;
                this.studentRepository = studentRepository;
                this.dailyChallengeService = dailyChallengeService;
        }

        public record BadgeResponse(String code, String displayName, String description, String icon, boolean earned) {
        }

        public record ChallengeResponse(Long id, String title, String description, int xpReward, int targetAmount,
                        int currentAmount, boolean claimed, boolean isCompleted) {
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

        @GetMapping("/daily-challenges")
        public ResponseEntity<List<ChallengeResponse>> getDailyChallenges(Principal principal) {
                String email = principal.getName();
                Student student = studentRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                List<DailyChallenge> challenges = dailyChallengeService.getTodayChallenges(student.getId());

                List<ChallengeResponse> response = challenges.stream()
                                .map(c -> new ChallengeResponse(
                                                c.getId(),
                                                c.getTitle(),
                                                c.getDescription(),
                                                c.getXpReward(),
                                                c.getTargetAmount(),
                                                c.getCurrentAmount(),
                                                c.isClaimed(),
                                                c.getCurrentAmount() >= c.getTargetAmount()))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(response);
        }

        @PostMapping("/daily-challenges/{id}/claim")
        public ResponseEntity<String> claimChallengeReward(@PathVariable Long id) {
                try {
                        dailyChallengeService.claimReward(id);
                        return ResponseEntity.ok("Reward claimed");
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }
}
