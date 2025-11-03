package com.practice.aiplatform.practice;

/**
 * A DTO (Data Transfer Object) record to represent the request
 * for submitting an answer.
 */
public record SubmitAnswerRequest(
        Long questionId,
        String answerText
) {
}

