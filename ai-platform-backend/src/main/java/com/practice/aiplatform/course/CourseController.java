package com.practice.aiplatform.course;

import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

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

    @PostMapping("/generate")
    public Mono<Object> generateCourse(@RequestBody GenerateCourseRequest request, Principal principal) {
        String email = principal.getName();
        System.out.println("🔔 CourseController: /generate called by " + email + " for topic: " + request.topic());

        if (request.topic() == null || request.topic().trim().isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "Topic is required")));
        }

        return courseGeneratorService.generateCourse(email, request.topic(), request.level())
                .map(course -> {
                    return ResponseEntity.ok(course);
                })
                .map(response -> (Object) response)
                .onErrorResume(e -> {
                    e.printStackTrace();
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Generation failed: " + e.getMessage())));
                });
    }

    @GetMapping
    public ResponseEntity<List<Course>> getMyCourses(Principal principal) {
        String email = principal.getName();
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Course> courses = courseRepository.findByStudentId(student.getId());
        return ResponseEntity.ok(courses);
    }
}
