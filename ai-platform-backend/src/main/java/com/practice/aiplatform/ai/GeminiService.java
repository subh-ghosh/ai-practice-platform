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

    public GeminiService(@Qualifier("geminiWebClient") WebClient webClient,
                         @Value("${gemini.api.key}") String apiKey) {
        this.webClient = webClient;
        this.apiKey = apiKey;
    }

    /**
     * Calls the Gemini API to generate a new question.
     *
     * @param subject    The subject of the question (e.g., "Java")
     * @param difficulty The difficulty of the question (e.g., "Graduation")
     * @param topic      The specific topic (e.g., "Inheritance")
     * @return A Mono<String> containing the clean question text.
     */
    // --- UPDATED SIGNATURE ---
    public Mono<String> generateQuestion(String subject, String difficulty, String topic) {

        // --- UPDATED PROMPT ---
        String prompt = String.format(
                "Generate one practice question for a %s level student on the subject of %s, focusing specifically on the topic of %s. " +
                        "Only return the question text, with no other formatting or introductory phrases.",
                difficulty, subject, topic
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

        String prompt = String.format(
                "A student was given the following question: \"%s\"\n" +
                        "The student provided this answer: \"%s\"\n\n" +
                        "Your task is to evaluate this answer line by line.\n" +
                        "1. On the very first line, write ONLY the single word 'CORRECT', 'INCORRECT', or 'CLOSE'.\n" +
                        "   - Use 'CLOSE' if the student's answer is on the right track but has a key flaw or is partially correct.\n" +
                        "2. On the next line, begin your detailed, constructive feedback.\n" +
                        "3. If the answer is 'INCORRECT' or 'CLOSE', add a new line at the very end starting with the exact text '[HINT]' followed by a detailed and informative hint to guide the student towards the correct solution or next steps.",
                questionText, answerText
        );

        return callGeminiApi(prompt)
                .map(this::extractTextFromResponse);
    }


    private Mono<GeminiResponse> callGeminiApi(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        return this.webClient.post()
                .uri(uriBuilder -> uriBuilder
                        // --- Using the model that we know works ---
                        .path("/v1beta/models/gemini-2.0-flash:generateContent")
                        .queryParam("key", this.apiKey)
                        .build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(GeminiResponse.class)
                .log();
    }


    private String extractTextFromResponse(GeminiResponse response) {
        try {
            return response.candidates().get(0)
                    .content().parts().get(0)
                    .text();
        } catch (Exception e) {
            System.err.println("Error parsing Gemini response: " + e.getMessage());
            return "Error: Could not parse AI response.";
        }
    }
}