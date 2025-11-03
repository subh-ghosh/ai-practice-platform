package com.practice.aiplatform.user;

/**
 * A Data Transfer Object (DTO) for handling login requests.
 * A 'record' is a modern Java feature that automatically creates
 * a private final field, a public getter, a constructor,
 * equals(), hashCode(), and toString() for each component.
 */
public record LoginRequest(String email, String password) {
}
