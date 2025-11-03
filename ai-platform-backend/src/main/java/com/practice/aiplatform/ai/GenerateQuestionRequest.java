package com.practice.aiplatform.ai;

/**
 * A DTO record to hold the request parameters for generating a question.
 *
 * @param subject    The subject (e.g., "Physics")
 * @param difficulty The difficulty (e.g., "High School")
 */
public record GenerateQuestionRequest(String subject, String difficulty) {
}
