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
     * (This method remains unchanged, but is here for context)
     */
    public Mono<String> generateQuestion(String subject, String difficulty, String topic) {

        String prompt = String.format(
                "Generate one practice question for a %s level student on the subject of %s, focusing specifically on the topic of %s. " +
                        "Only return the question text, with no other formatting or introductory phrases.",
                difficulty, subject, topic
        );

        return callGeminiApi(prompt)
                .map(this::extractTextFromResponse);
    }

    /**
     * Calls the Gemini API to evaluate a student's answer.
     *
     * @param questionText The original question.
     * @param answerText   The student's submitted answer.
     * @param subject      The question's subject.
     * @param topic        The question's topic.
     * @param difficulty   The question's difficulty.
     * @return A Mono<String> containing the AI's feedback.
     */
    // --- UPDATED SIGNATURE ---
    public Mono<String> evaluateAnswer(String questionText, String answerText, String subject, String topic, String difficulty) {

        // --- UPDATED PROMPT ---
        String prompt = String.format(
                "A student is practicing the subject '%s' on the topic of '%s' at a '%s' level.\n" +
                        "The student was given the following question: \"%s\"\n" +
                        "The student provided this answer: \"%s\"\n\n" +
                        "Your task is to evaluate this answer line by line based on the subject and topic.\n" +
                        "1. On the very first line, write ONLY the single word 'CORRECT', 'INCORRECT', or 'CLOSE'.\n" +
                        "   - Use 'CLOSE' if the student's answer is on the right track but has a key flaw or is partially correct.\n" +
                        "2. On the next line, begin your detailed, constructive feedback.\n" +
                        "3. If the answer is 'INCORRECT' or 'CLOSE', add a new line at the very end starting with the exact text '[HINT]' followed by a detailed and informative hint to guide the student.",
                subject, topic, difficulty, questionText, answerText
        );

        return callGeminiApi(prompt)
                .map(this::extractTextFromResponse);
    }

    /**
     * Calls the Gemini API to generate a hint for a question.
     *
     * @param questionText The original question.
     * @param subject      The question's subject.
     * @param topic        The question's topic.
     * @param difficulty   The question's difficulty.
     * @return A Mono<String> containing the AI's hint.
     */
    // --- UPDATED SIGNATURE ---
    public Mono<String> getHint(String questionText, String subject, String topic, String difficulty) {

        // --- UPDATED PROMPT ---
        String prompt = String.format(
                "You are a helpful teaching assistant. A student is stuck on the following question for the subject '%s' (topic: '%s', difficulty: '%s'):\n" +
                        "\"%s\"\n\n" +
                        "Your task is to provide a single, concise, and helpful hint to guide them toward the solution. " +
                        "Do NOT provide the full answer. Only return the hint text.",
                subject, topic, difficulty, questionText
        );

        return callGeminiApi(prompt)
                .map(this::extractTextFromResponse);
    }

    /**
     * Calls the Gemini API to generate a full, correct answer for a question.
     *
     * @param questionText The original question.
     * @param subject      The question's subject.
     * @param topic        The question's topic.
     * @param difficulty   The question's difficulty.
     * @return A Mono<String> containing the AI's correct answer.
     */
    // --- UPDATED SIGNATURE ---
    public Mono<String> getCorrectAnswer(String questionText, String subject, String topic, String difficulty) {

        // --- UPDATED PROMPT ---
        String prompt = String.format(
                "You are an expert in this subject. A student has asked for the correct answer to the following '%s' level question about '%s' (subject: '%s'):\n" +
                        "\"%s\"\n\n" +
                        "Your task is to provide a correct, well-explained answer. " +
                        "Start by providing the direct answer, then provide a step-by-step explanation.",
                difficulty, topic, subject, questionText
        );

        return callGeminiApi(prompt)
                .map(this::extractTextFromResponse);
    }


    private Mono<GeminiResponse> callGeminiApi(String prompt) {
        // ... (this method remains unchanged)
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        return this.webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1beta/models/gemini-2.0-flash:generateContent")
                        .queryParam("key", this.apiKey)
                        .build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(GeminiResponse.class)
                .log();
    }


    private String extractTextFromResponse(GeminiResponse response) {
        // ... (this method remains unchanged)
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