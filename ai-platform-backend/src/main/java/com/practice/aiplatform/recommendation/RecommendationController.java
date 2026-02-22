package com.practice.aiplatform.recommendation;

import com.practice.aiplatform.ai.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final AiService geminiService;
    @Lazy
    @Autowired
    private RecommendationController self;

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
    public ResponseEntity<Map<String, String>> getAiCoachInsight(Principal principal) {
        return ResponseEntity.ok(self.getAiCoachInsightCached(principal.getName()));
    }

    @Cacheable(value = "UserAiCoachInsightCache", key = "#email", sync = true)
    public Map<String, String> getAiCoachInsightCached(String email) {
        try {
            String promptData = recommendationService.buildAiCoachPromptData(email);

            if (promptData == null) {
                return createInsightResponse(
                        "Welcome! Start practicing to receive personalized coaching insights.");
            }

            String prompt = "You are a concise, encouraging learning coach. Based on this student's recent practice data, "
                    +
                    "give a 2-sentence coaching insight. Be specific about topics. " +
                    "Format: First sentence about what they're doing well or struggling with. " +
                    "Second sentence is actionable advice. Keep it under 50 words total.\n\n" + promptData;

            String insight = geminiService.generateRawContent(prompt);

            return createInsightResponse(
                    insight != null ? insight.trim() : "Keep practicing! Consistency is key.");
        } catch (Exception e) {
            return createInsightResponse("Keep going! Every practice session makes you stronger.");
        }
    }

    private Map<String, String> createInsightResponse(String insight) {
        Map<String, String> response = new HashMap<>();
        response.put("insight", insight);
        response.put("suggestedTopic", "");
        response.put("suggestedAction", "PRACTICE");
        return response;
    }
}
