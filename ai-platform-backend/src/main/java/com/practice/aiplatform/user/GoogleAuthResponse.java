// FILE: ai-Tplatform/ai-platform-backend/src/main/java/com/practice/aiplatform/user/GoogleAuthResponse.java
package com.practice.aiplatform.user;

// A flexible response to handle both login and registration triggers
public record GoogleAuthResponse(
        String status,    // e.g., "LOGIN_SUCCESS", "NEEDS_REGISTRATION"
        StudentDto student,  // The full student DTO (if login)
        String token,      // Your app's JWT (if login)
        String email,      // Pre-filled data (if registration)
        String firstName,  // Pre-filled data (if registration)
        String lastName    // Pre-filled data (if registration)
) {}