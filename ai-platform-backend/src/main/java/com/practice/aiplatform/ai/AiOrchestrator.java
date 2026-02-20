package com.practice.aiplatform.ai;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class AiOrchestrator {

    private final AiService aiService;

    public AiOrchestrator(AiService aiService) {
        this.aiService = aiService;
    }

    @Cacheable(value = "questions", key = "#userEmail + '_' + #subject + '_' + #difficulty + '_' + #topic + '_' + (#previousQuestion != null ? #previousQuestion : 'null') + '_' + (#previousStatus != null ? #previousStatus : 'null')")
    public String generateQuestion(String subject, String difficulty, String topic, String previousQuestion,
            String previousStatus, String userEmail, String prompt) {
        System.out.println("[AiOrchestrator] CACHE MISS: Generating question for " + topic);
        return aiService.generateRawContent(prompt).block();
    }

    @Cacheable(value = "hints", key = "#questionText + '_' + #difficulty")
    public String getHint(String prompt, String questionText, String difficulty) {
        System.out.println("[AiOrchestrator] CACHE MISS: Generating hint");
        return aiService.generateRawContent(prompt).block();
    }

    @Cacheable(value = "answers", key = "#questionText")
    public String getCorrectAnswer(String prompt, String questionText) {
        System.out.println("[AiOrchestrator] CACHE MISS: Generating correct answer");
        return aiService.generateRawContent(prompt).block();
    }
}
