package com.practice.aiplatform.recommendation;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<List<RecommendationService.Recommendation>> getDashboardRecommendations(Principal principal) {
        return ResponseEntity.ok(recommendationService.getRecommendations(principal.getName()));
    }

    @GetMapping("/predict")
    public ResponseEntity<RecommendationService.Prediction> predictSuccess(
            @RequestParam String topic,
            @RequestParam String difficulty,
            Principal principal) {
        return ResponseEntity.ok(recommendationService.predictSuccess(principal.getName(), topic, difficulty));
    }
}
