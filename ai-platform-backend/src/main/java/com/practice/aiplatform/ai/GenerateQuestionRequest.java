package com.practice.aiplatform.ai;

/**
 * A DTO record to hold the request parameters for generating a question.
 *
 * @param subject    The subject (e.g., "Java")
 * @param difficulty The difficulty (e.g., "High School")
 * @param topic      The specific topic (e.g., "Inheritance")
 */
public record GenerateQuestionRequest(String subject, String difficulty, String topic) {
}