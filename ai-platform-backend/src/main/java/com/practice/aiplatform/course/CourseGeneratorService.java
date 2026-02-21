package com.practice.aiplatform.course;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.practice.aiplatform.ai.AiService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CourseGeneratorService {

    private final AiService aiService;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;

    public CourseGeneratorService(
            AiService aiService,
            CourseRepository courseRepository,
            StudentRepository studentRepository,
            ObjectMapper objectMapper) {
        this.aiService = aiService;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.objectMapper = objectMapper;
    }

    public Course generateCourse(String userEmail, String topic, String level) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String prompt = buildPrompt(topic, level);
        String aiText = aiService.generateRawContent(prompt);

        return parseAndSaveCourse(aiText, student, topic, level);
    }

    private String buildPrompt(String topic, String level) {
        return String.format("""
                Create a course for topic "%s" at level "%s".

                Return only JSON:
                {
                  "title": "Course Title",
                  "description": "Short summary",
                  "modules": [
                    {
                      "title": "Module Title",
                      "content": "Module lesson content"
                    }
                  ]
                }
                """, topic, level);
    }

    private Course parseAndSaveCourse(String aiText, Student student, String topic, String level) {
        try {
            String cleanJson = aiText.replace("```json", "").replace("```", "").trim();
            JsonNode root = objectMapper.readTree(cleanJson);

            Course course = new Course();
            course.setTitle(root.path("title").asText("Generated Course"));
            course.setDescription(root.path("description").asText(""));
            course.setTopic(topic);
            course.setDifficultyInfo(level);
            course.setStudent(student);
            course.setCreatedAt(LocalDateTime.now());

            JsonNode modules = root.path("modules");
            if (modules.isArray()) {
                int orderIndex = 1;
                for (JsonNode moduleNode : modules) {
                    Module module = new Module();
                    module.setTitle(moduleNode.path("title").asText("Module"));
                    module.setContent(moduleNode.path("content").asText(""));
                    module.setOrderIndex(orderIndex++);
                    course.addModule(module);
                }
            }

            return courseRepository.save(course);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse and save generated course: " + e.getMessage(), e);
        }
    }
}