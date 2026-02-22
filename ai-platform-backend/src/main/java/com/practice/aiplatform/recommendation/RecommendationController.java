package com.practice.aiplatform.recommendation;

import com.practice.aiplatform.ai.AiService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final AiService geminiService;

    public RecommendationController(RecommendationService recommendationService,
            AiService geminiService) {
        this.recommendationService = recommendationService;
        this.geminiService = geminiService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<List<RecommendationService.EnhancedRecommendation>> getDashboardRecommendations(
            Principal principal) {
        return ResponseEntity.ok(recommendationService.getRecommendations(principal.getName()));
    }

    @GetMapping("/predict")
    public ResponseEntity<RecommendationService.Prediction> predictSuccess(
            @RequestParam String topic,
            @RequestParam String difficulty,
            Principal principal) {
        return ResponseEntity.ok(recommendationService.predictSuccess(principal.getName(), topic, difficulty));
    }

    @GetMapping("/ai-coach")
    @Cacheable(value = "UserAiCoachInsightCache", key = "#principal.name", sync = true)
    public ResponseEntity<Map<String, String>> getAiCoachInsight(Principal principal) {
        try {
            String promptData = recommendationService.buildAiCoachPromptData(principal.getName());

            if (promptData == null) {
                return ResponseEntity.ok(Map.of(
                        "insight", "Welcome! Start practicing to receive personalized coaching insights.",
                        "suggestedTopic", "",
                        "suggestedAction", "PRACTICE"));
            }

            String prompt = "You are a concise, encouraging learning coach. Based on this student's recent practice data, "
                    +
                    "give a 2-sentence coaching insight. Be specific about topics. " +
                    "Format: First sentence about what they're doing well or struggling with. " +
                    "Second sentence is actionable advice. Keep it under 50 words total.\n\n" + promptData;

            String insight = geminiService.generateRawContent(prompt);

            return ResponseEntity.ok(Map.of(
                    "insight", insight != null ? insight.trim() : "Keep practicing! Consistency is key.",
                    "suggestedTopic", "",
                    "suggestedAction", "PRACTICE"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "insight", "Keep going! Every practice session makes you stronger.",
                    "suggestedTopic", "",
                    "suggestedAction", "PRACTICE"));
        }
    }
}
