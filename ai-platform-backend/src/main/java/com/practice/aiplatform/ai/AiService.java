package com.practice.aiplatform.ai;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

        private final WebClient webClient;
        private final String apiKey;
        private final String practiceModel;
        private final String studyPlanModel;

        public AiService(@Qualifier("aiWebClient") WebClient webClient,
                        @Value("${groq.api.key}") String apiKey,
                        @Value("${ai.model.practice:llama-3.1-8b-instant}") String practiceModel,
                        @Value("${ai.model.study-plan:llama-3.3-70b-versatile}") String studyPlanModel) {
                this.webClient = webClient;
                this.apiKey = apiKey;
                this.practiceModel = practiceModel;
                this.studyPlanModel = studyPlanModel;
        }

        /**
         * Generates raw content for general/practice usage.
         */
        private final java.util.Map<String, Mono<String>> responseCache = new java.util.concurrent.ConcurrentHashMap<>();

        public Mono<String> generateRawContent(String prompt) {
                return generatePracticeContent(prompt);
        }

        public Mono<String> generatePracticeContent(String prompt) {
                String cacheKey = "practice::" + this.practiceModel + "::" + prompt;
                return responseCache.computeIfAbsent(cacheKey, key -> callAiApi(prompt, this.practiceModel)
                                .map(this::extractTextFromResponse)
                                .cache()
                );
        }

        public Mono<String> generateStudyPlanContent(String prompt) {
                String cacheKey = "studyplan::" + this.studyPlanModel + "::" + prompt;
                return responseCache.computeIfAbsent(cacheKey, key -> callAiApi(prompt, this.studyPlanModel)
                                .map(this::extractTextFromResponse)
                                .cache());
        }

        /**
         * Calls the AI API to generate a new question.
         */
        public Mono<String> generateQuestion(String subject, String difficulty, String topic) {
                return generateQuestion(subject, difficulty, topic, null, null);
        }

        public Mono<String> generateQuestion(String subject, String difficulty, String topic, String previousQuestion,
                        String previousStatus) {

                String contextPrompt = "";
                if (previousQuestion != null && previousStatus != null) {
                        if ("CORRECT".equalsIgnoreCase(previousStatus)) {
                                contextPrompt = String.format(
                                                "The student just ANSWERED CORRECTLY a question on this topic: \"%s\". "
                                                                +
                                                                "Now, generate a slightly more challenging question or explore a related advanced nuance. ",
                                                previousQuestion);
                        } else {
                                contextPrompt = String.format(
                                                "The student just FAILED a question on this topic: \"%s\". " +
                                                                "Now, generate a SIMPLER question to help them understand the fundamental concept better. ",
                                                previousQuestion);
                        }
                }

                String prompt = String.format(
                                "%sGenerate one practice question for a %s level student on the subject of %s, focusing specifically on the topic of %s. "
                                                +
                                                "Only return the question text, with no other formatting or introductory phrases.",
                                contextPrompt, difficulty, subject, topic);

                return callAiApi(prompt, this.practiceModel)
                                .map(this::extractTextFromResponse);
        }

        /**
         * Calls the AI API to evaluate a student's answer.
         *
         * @param questionText The original question.
         * @param answerText   The student's submitted answer.
         * @param subject      The question's subject.
         * @param topic        The question's topic.
         * @param difficulty   The question's difficulty.
         * @return A Mono<String> containing the AI's feedback.
         */
        // --- UPDATED SIGNATURE ---
        public Mono<String> evaluateAnswer(String questionText, String answerText, String subject, String topic,
                        String difficulty) {

                // --- UPDATED PROMPT ---
                String prompt = String.format(
                                "A student is practicing the subject '%s' on the topic of '%s' at a '%s' level.\n" +
                                                "The student was given the following question: \"%s\"\n" +
                                                "The student provided this answer: \"%s\"\n\n" +
                                                "Your task is to evaluate this answer line by line based on the subject and topic.\n"
                                                +
                                                "1. On the very first line, write ONLY the single word 'CORRECT', 'INCORRECT', or 'CLOSE'.\n"
                                                +
                                                "   - Use 'CLOSE' if the student's answer is on the right track but has a key flaw or is partially correct.\n"
                                                +
                                                "2. On the next line, begin your detailed, constructive feedback.\n" +
                                                "3. If the answer is 'INCORRECT' or 'CLOSE', add a new line at the very end starting with the exact text '[HINT]' followed by a detailed and informative hint to guide the student.",
                                subject, topic, difficulty, questionText, answerText);

                return callAiApi(prompt, this.practiceModel)
                                .map(this::extractTextFromResponse);
        }

        /**
         * Calls the AI API to generate a hint for a question.
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
                                "You are a helpful teaching assistant. A student is stuck on the following question for the subject '%s' (topic: '%s', difficulty: '%s'):\n"
                                                +
                                                "\"%s\"\n\n" +
                                                "Your task is to provide a single, concise, and helpful hint to guide them toward the solution. "
                                                +
                                                "Do NOT provide the full answer. Only return the hint text.",
                                subject, topic, difficulty, questionText);

                return callAiApi(prompt, this.practiceModel)
                                .map(this::extractTextFromResponse);
        }

        /**
         * Calls the AI API to generate a full, correct answer for a question.
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
                                "You are an expert in this subject. A student has asked for the correct answer to the following '%s' level question about '%s' (subject: '%s'):\n"
                                                +
                                                "\"%s\"\n\n" +
                                                "Your task is to provide a correct, well-explained answer. " +
                                                "Start by providing the direct answer, then provide a step-by-step explanation.",
                                difficulty, topic, subject, questionText);

                return callAiApi(prompt, this.practiceModel)
                                .map(this::extractTextFromResponse);
        }

        public Mono<String> generateRawContent(String prompt, String mimeType, byte[] data) {
                return generateStudyPlanContent(prompt, mimeType, data);
        }

        public Mono<String> generateStudyPlanContent(String prompt, String mimeType, byte[] data) {
                String fullPrompt = prompt;
                if (mimeType != null && mimeType.startsWith("text/")) {
                        String textPayload = new String(data, StandardCharsets.UTF_8);
                        fullPrompt = prompt + "\n\nAttached text content:\n" + textPayload;
                } else if (mimeType != null && data != null && data.length > 0) {
                        return Mono.error(new RuntimeException(
                                        "Current AI provider supports text attachments only. Convert the syllabus to plain text and retry."));
                }
                return callAiApi(fullPrompt, this.studyPlanModel).map(this::extractTextFromResponse);
        }

        private Mono<AiResponse> callAiApi(String prompt, String model) {
                Map<String, Object> requestBody = Map.of(
                                "model", model,
                                "messages", List.of(
                                                Map.of(
                                                                "role", "user",
                                                                "content", prompt)),
                                "temperature", 0.2);

                return this.webClient.post()
                                .uri("/v1/chat/completions")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + this.apiKey)
                                .bodyValue(requestBody)
                                .retrieve()
                                .onStatus(
                                                status -> status.is4xxClientError() || status.is5xxServerError(),
                                                clientResponse -> clientResponse.bodyToMono(String.class)
                                                                .flatMap(errorBody -> {
                                                                        System.err.println("AI API ERROR: "
                                                                                        + errorBody);
                                                                        return Mono.error(new RuntimeException(
                                                                                        "AI API Error: "
                                                                                                        + errorBody));
                                                                }))
                                .bodyToMono(AiResponse.class)
                                .doOnError(e -> System.err.println("CRITICAL ERROR: " + e.getMessage()));
        }

        private String extractTextFromResponse(AiResponse response) {
                try {
                        return response.choices().get(0).message().content();
                } catch (Exception e) {
                        System.err.println("Error parsing AI response: " + e.getMessage());
                        return "Error: Could not parse AI response.";
                }
        }
}
