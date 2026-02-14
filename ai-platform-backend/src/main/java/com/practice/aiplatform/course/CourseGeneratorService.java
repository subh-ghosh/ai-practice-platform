package com.practice.aiplatform.course;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.practice.aiplatform.ai.GeminiService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
public class CourseGeneratorService {

    private final GeminiService geminiService;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;

    public CourseGeneratorService(GeminiService geminiService,
            CourseRepository courseRepository,
            StudentRepository studentRepository,
            ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.objectMapper = objectMapper;
    }

    public Mono<Course> generateCourse(String userEmail, String topic, String level) {
        return Mono.just(userEmail)
                .map(email -> studentRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Student not found")))
                .flatMap(student -> {
                    String prompt = createPrompt(topic, level);
                    return geminiService.generateRawContent(prompt)
                            .map(jsonResponse -> parseAndSaveCourse(jsonResponse, student, topic, level));
                });
    }

    private String createPrompt(String topic, String level) {
        return String.format("""
                Create a structured course on the topic: "%s" for a "%s" level student.
                Return ONLY valid JSON with this structure:
                {
                  "title": "Course Title",
                  "description": "Brief description",
                  "modules": [
                    {
                      "title": "Module Title",
                      "content": "Detailed lesson content for this module (at least 3 sentences)."
                    }
                  ]
                }
                Do not include Markdown formatting (like ```json), just the raw JSON.
                """, topic, level);
    }

    private Course parseAndSaveCourse(String jsonResponse, Student student, String topic, String level) {
        try {
            // Clean up Markdown code blocks if present (just in case)
            String cleanJson = jsonResponse.replace("```json", "").replace("```", "").trim();

            JsonNode root = objectMapper.readTree(cleanJson);

            Course course = new Course();
            course.setTitle(root.path("title").asText("Generated Course"));
            course.setDescription(root.path("description").asText(""));
            course.setTopic(topic);
            course.setDifficultyInfo(level);
            course.setStudent(student);
            course.setCreatedAt(LocalDateTime.now());

            JsonNode modulesNode = root.path("modules");
            if (modulesNode.isArray()) {
                int index = 1;
                for (JsonNode moduleNode : modulesNode) {
                    Module module = new Module();
                    module.setTitle(moduleNode.path("title").asText("New Module"));
                    module.setContent(moduleNode.path("content").asText(""));
                    module.setOrderIndex(index++);
                    course.addModule(module);
                }
            }

            return courseRepository.save(course);

        } catch (Exception e) {
            System.err.println("JSON Parsing Error: " + e.getMessage());
            System.err.println("Raw Response: " + jsonResponse);
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage());
        }
    }
}
