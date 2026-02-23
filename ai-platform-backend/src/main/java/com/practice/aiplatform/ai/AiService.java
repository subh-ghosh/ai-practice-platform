package com.practice.aiplatform.ai;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

        private final WebClient webClient;
        private final String apiKey;
        private final String practiceModel;
        private final String studyPlanModel;

        public AiService(
                @Qualifier("aiWebClient") WebClient webClient,
                @Value("${groq.api.key}") String apiKey,
                @Value("${ai.model.practice:llama-3.1-8b-instant}") String practiceModel,
                @Value("${ai.model.study-plan:llama-3.3-70b-versatile}") String studyPlanModel) {
                this.webClient = webClient;
                this.apiKey = apiKey;
                this.practiceModel = practiceModel;
                this.studyPlanModel = studyPlanModel;
        }

        public String generateRawContent(String prompt) {
                return generatePracticeContent(prompt);
        }

        public String generatePracticeContent(String prompt) {
                AiResponse response = callAiApi(prompt, practiceModel);
                return extractTextFromResponse(response);
        }

        public String generateStudyPlanContent(String prompt) {
                AiResponse response = callAiApi(prompt, studyPlanModel);
                return extractTextFromResponse(response);
        }

        public String generateQuestion(String subject, String difficulty, String topic) {
                return generateQuestion(subject, difficulty, topic, null, null);
        }

        @Cacheable(
                value = "AiQuestionCache",
                key = "#subject + '|' + #difficulty + '|' + #topic + '|' + (#previousQuestion ?: '') + '|' + (#previousStatus ?: '')",
                sync = true
        )
        public String generateQuestion(
                String subject,
                String difficulty,
                String topic,
                String previousQuestion,
                String previousStatus) {

                String contextPrompt = "";
                if (previousQuestion != null && previousStatus != null) {
                        if ("CORRECT".equalsIgnoreCase(previousStatus)) {
                                contextPrompt = String.format(
                                        "The student just answered correctly on this topic: \"%s\". "
                                                + "Generate a slightly more challenging question. ",
                                        previousQuestion);
                        } else {
                                contextPrompt = String.format(
                                        "The student just failed on this topic: \"%s\". "
                                                + "Generate a simpler question to reinforce basics. ",
                                        previousQuestion);
                        }
                }

                String prompt = String.format(
                        "%sGenerate one practice question for %s level in %s on topic %s. "
                                + "Return only question text.",
                        contextPrompt, difficulty, subject, topic);

                AiResponse response = callAiApi(prompt, practiceModel);
                return extractTextFromResponse(response);
        }

        @Cacheable(
                value = "AiEvaluateCache",
                key = "#subject + '|' + #topic + '|' + #difficulty + '|' + #questionText + '|' + #answerText",
                sync = true
        )
        public String evaluateAnswer(String questionText, String answerText, String subject, String topic, String difficulty) {
                String prompt = String.format(
                        "Subject: %s, Topic: %s, Level: %s.\n"
                                + "Question: \"%s\"\n"
                                + "Student Answer: \"%s\"\n\n"
                                + "Reply in this format:\n"
                                + "Line 1: CORRECT or INCORRECT or CLOSE\n"
                                + "Line 2+: Feedback\n"
                                + "If INCORRECT/CLOSE add [HINT] at end with a helpful hint.",
                        subject, topic, difficulty, questionText, answerText);

                AiResponse response = callAiApi(prompt, practiceModel);
                return extractTextFromResponse(response);
        }

        @Cacheable(
                value = "AiHintCache",
                key = "#subject + '|' + #topic + '|' + #difficulty + '|' + #questionText",
                sync = true
        )
        public String getHint(String questionText, String subject, String topic, String difficulty) {
                String prompt = String.format(
                        "Give one concise hint only.\n"
                                + "Subject: %s, Topic: %s, Difficulty: %s\n"
                                + "Question: \"%s\"",
                        subject, topic, difficulty, questionText);

                AiResponse response = callAiApi(prompt, practiceModel);
                return extractTextFromResponse(response);
        }

        @Cacheable(
                value = "AiAnswerCache",
                key = "#subject + '|' + #topic + '|' + #difficulty + '|' + #questionText",
                sync = true
        )
        public String getCorrectAnswer(String questionText, String subject, String topic, String difficulty) {
                String prompt = String.format(
                        "Provide the correct answer and short explanation.\n"
                                + "Subject: %s, Topic: %s, Difficulty: %s\n"
                                + "Question: \"%s\"",
                        subject, topic, difficulty, questionText);

                AiResponse response = callAiApi(prompt, practiceModel);
                return extractTextFromResponse(response);
        }

        public String generateRawContent(String prompt, String mimeType, byte[] data) {
                return generateStudyPlanContent(prompt, mimeType, data);
        }

        public String generateStudyPlanContent(String prompt, String mimeType, byte[] data) {
                String finalPrompt = prompt;

                if (mimeType != null && mimeType.startsWith("text/") && data != null) {
                        String textPayload = new String(data, StandardCharsets.UTF_8);
                        finalPrompt = prompt + "\n\nAttached text:\n" + textPayload;
                } else if ("application/pdf".equalsIgnoreCase(mimeType) && data != null && data.length > 0) {
                        String pdfText = extractPdfText(data);
                        if (pdfText.isBlank()) {
                                throw new RuntimeException("Could not extract readable text from the PDF.");
                        }
                        finalPrompt = prompt + "\n\nExtracted PDF text:\n" + pdfText;
                } else if (mimeType != null && data != null && data.length > 0) {
                        throw new RuntimeException("Only text and PDF files are supported.");
                }

                AiResponse response = callAiApi(finalPrompt, studyPlanModel);
                return extractTextFromResponse(response);
        }

        private String extractPdfText(byte[] data) {
                try (PDDocument document = Loader.loadPDF(data)) {
                        PDFTextStripper stripper = new PDFTextStripper();
                        return stripper.getText(document).trim();
                } catch (Exception e) {
                        throw new RuntimeException("Failed to read PDF content: " + e.getMessage(), e);
                }
        }

        private AiResponse callAiApi(String prompt, String model) {
                Map<String, Object> requestBody = Map.of(
                        "model", model,
                        "messages", List.of(Map.of("role", "user", "content", prompt)),
                        "temperature", 0.2
                );

                return webClient.post()
                        .uri("/v1/chat/completions")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                        .bodyValue(requestBody)
                        .retrieve()
                        .onStatus(
                                status -> status.is4xxClientError() || status.is5xxServerError(),
                                clientResponse -> clientResponse.bodyToMono(String.class).flatMap(errorBody ->
                                        reactor.core.publisher.Mono.error(new RuntimeException("AI API Error: " + errorBody))
                                )
                        )
                        .bodyToMono(AiResponse.class)
                        .block();
        }

        private String extractTextFromResponse(AiResponse response) {
                try {
                        return response.choices().get(0).message().content();
                } catch (Exception e) {
                        return "Error: Could not parse AI response.";
                }
        }
}
