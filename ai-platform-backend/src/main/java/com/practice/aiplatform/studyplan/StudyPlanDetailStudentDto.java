package com.practice.aiplatform.studyplan;

public record StudyPlanDetailStudentDto(
        Long id,
        String firstName,
        String lastName,
        String gender,
        String bio,
        String headline,
        String avatarUrl,
        String githubUrl,
        String linkedinUrl,
        String websiteUrl,
        String subscriptionStatus,
        int totalXp,
        int streakDays,
        String lastLoginDate
) {
}
