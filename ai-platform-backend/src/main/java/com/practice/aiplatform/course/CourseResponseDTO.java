package com.practice.aiplatform.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponseDTO {
    private Long id;
    private String title;
    private String topic;
    private String difficulty;
    private int progress;
    private boolean isCompleted;
    private LocalDateTime createdAt;

    public static CourseResponseDTO fromEntity(Course course) {
        return new CourseResponseDTO(
                course.getId(),
                course.getTitle(),
                course.getTopic(),
                course.getDifficultyInfo(),
                course.getProgress(),
                course.isCompleted(),
                course.getCreatedAt());
    }
}
