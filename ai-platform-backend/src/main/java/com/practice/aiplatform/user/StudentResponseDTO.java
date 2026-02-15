package com.practice.aiplatform.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponseDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String subscriptionStatus;
    private String bio;
    private String headline;
    private String avatarUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String websiteUrl;
    private int totalXp;
    private int streakDays;
    private int freeActionsUsed;
    private LocalDate lastLoginDate;

    // Static mapper for convenience
    public static StudentResponseDTO fromEntity(Student student) {
        return new StudentResponseDTO(
                student.getId(),
                student.getEmail(),
                student.getFirstName(),
                student.getLastName(),
                student.getSubscriptionStatus(),
                student.getBio(),
                student.getHeadline(),
                student.getAvatarUrl(),
                student.getGithubUrl(),
                student.getLinkedinUrl(),
                student.getWebsiteUrl(),
                student.getTotalXp(),
                student.getStreakDays(),
                student.getFreeActionsUsed(),
                student.getLastLoginDate());
    }
}
