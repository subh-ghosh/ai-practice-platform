package com.practice.aiplatform.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;

    @Autowired
    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * API endpoint to generate a practice question.
     * It accepts a JSON object with "subject" and "difficulty".
     *
     * @param request The DTO holding the request data.
     * @return A Mono<String> containing the raw JSON response from the Gemini API.
     */
    @PostMapping("/generate-question")
    public Mono<String> generateQuestion(@RequestBody GenerateQuestionRequest request) {
        // Call the service with the parameters from the request DTO
        return geminiService.generateQuestion(request.subject(), request.difficulty());
    }
}
