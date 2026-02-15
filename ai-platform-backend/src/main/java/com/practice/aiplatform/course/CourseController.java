package com.practice.aiplatform.course;

import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
// @CrossOrigin removed - handled globally
public class CourseController {

    private final CourseGeneratorService courseGeneratorService;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    public CourseController(CourseGeneratorService courseGeneratorService,
            CourseRepository courseRepository,
            StudentRepository studentRepository) {
        this.courseGeneratorService = courseGeneratorService;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
    }

    public record GenerateCourseRequest(String topic, String level) {
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Course Controller is ALIVE");
    }

    @GetMapping("/auth-check")
    public ResponseEntity<String> checkAuth(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No Principal");
        }
        return ResponseEntity.ok("Authenticated as: " + principal.getName());
    }

    @CrossOrigin // Added back to match AiController exactly
    @PostMapping("/generate")
    public ResponseEntity<?> generateCourse(@RequestBody GenerateCourseRequest request, Principal principal) {
        String email = principal.getName();
        System.out.println("🔔 CourseController: /generate called by " + email + " for topic: " + request.topic());

        if (request.topic() == null || request.topic().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Topic is required"));
        }

        try {
            // BLOCKING CALL to match AiController's working pattern
            // This ensures SecurityContext is preserved on the servlet thread
            var course = courseGeneratorService.generateCourse(email, request.topic(), request.level())
                    .block();

            return ResponseEntity.ok(course);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Generation failed: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<CourseResponseDTO>> getMyCourses(Principal principal) {
        String email = principal.getName();
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Course> courses = courseRepository.findByStudentId(student.getId());
        List<CourseResponseDTO> dtos = courses.stream()
                .map(CourseResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id, Principal principal) {
        String email = principal.getName();
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not own this course"));
        }

        courseRepository.delete(course);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }
}
