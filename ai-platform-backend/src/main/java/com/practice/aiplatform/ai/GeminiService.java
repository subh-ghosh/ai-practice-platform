package com.practice.aiplatform.ai;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final String apiKey;

    // We inject the specific "geminiWebClient" bean we created in WebClientConfig
    // We also inject the API key from our application.properties file
    public GeminiService(@Qualifier("geminiWebClient") WebClient webClient,
                         @Value("${gemini.api.key}") String apiKey) {
        this.webClient = webClient;
        this.apiKey = apiKey;
    }

    /**
     * Calls the Gemini API to generate a new question.
     *
     * @param subject    The subject of the question (e.g., "Calculus")
     * @param difficulty The difficulty of the question (e.g., "University")
     * @return A Mono<String> containing the clean question text.
     */
    public Mono<String> generateQuestion(String subject, String difficulty) {
        // Build a prompt for the AI
        String prompt = String.format(
                "Generate one practice question for a %s student on the subject of %s. " +
                        "Only return the question text, with no other formatting or introductory phrases.",
                difficulty, subject
        );

        return callGeminiApi(prompt)
                .map(this::extractTextFromResponse); // Parse the response
    }

    /**
     * Calls the Gemini API to evaluate a student's answer.
     *
     * @param questionText The original question.
     * @param answerText   The student's submitted answer.
     * @return A Mono<String> containing the AI's feedback.
     */
    public Mono<String> evaluateAnswer(String questionText, String answerText) {
        // Build a prompt for evaluation
        String prompt = String.format(
                "A student was given the following question: \"%s\"\n" +
                        "The student provided this answer: \"%s\"\n" +
                        "First, determine if the answer is 'CORRECT' or 'INCORRECT'. " +
                        "Then, provide constructive feedback for the student. " +
                        "Format your response as 'CORRECT: [Your feedback]' or 'INCORRECT: [Your feedback]'.",
                questionText, answerText
        );

        return callGeminiApi(prompt)
                .map(this::extractTextFromResponse); // Parse the response
    }

    /**
     * A private helper method to make the actual API call.
     *
     * @param prompt The prompt to send to the AI.
     * @return A Mono<GeminiResponse> containing the full, parsed JSON response.
     */
    private Mono<GeminiResponse> callGeminiApi(String prompt) {
        // This is the JSON structure the Gemini API expects
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        return this.webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path(":generateContent")
                        .queryParam("key", this.apiKey)
                        .build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(GeminiResponse.class) // Automatically parse the JSON into our DTO
                .log(); // Log the request/response for debugging
    }

    /**
     * A private helper method to safely parse the GeminiResponse object.
     *
     * @param response The parsed GeminiResponse object.
     * @return The clean text from the AI, or an error message.
     */
    private String extractTextFromResponse(GeminiResponse response) {
        try {
            // Navigate the nested JSON structure to get the text
            return response.candidates().get(0)
                    .content().parts().get(0)
                    .text();
        } catch (Exception e) {
            // Handle cases where the response is not as expected
            System.err.println("Error parsing Gemini response: " + e.getMessage());
            return "Error: Could not parse AI response.";
        }
    }
}


