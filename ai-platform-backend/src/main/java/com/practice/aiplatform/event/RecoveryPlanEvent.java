package com.practice.aiplatform.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecoveryPlanEvent {
    private String userEmail;
    private String topic;
    private String difficulty;
    private int days;
    private Long planId;
}
