package com.practice.aiplatform.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeCompletedEvent {
    private String userEmail;
    private Long practiceSessionId;
    private int scoreEarned;
    private int totalQuestions;
    private String subject;
    private LocalDateTime completedAt;
}
