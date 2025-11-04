package com.practice.aiplatform.user;

public record StudentDto(
        Long id,
        String email,
        String firstName,
        String lastName,
        String gender,
        String token
) {}
