package com.practice.aiplatform.course;

import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseGeneratorService courseGeneratorService;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    @Lazy
    @Autowired
    private CourseController self;

    public CourseController(
            CourseGeneratorService courseGeneratorService,
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
        return ResponseEntity.ok("Course Controller is ALIVE | cache-schema=v2 | serializer=typed");
    }

    @GetMapping("/auth-check")
    public ResponseEntity<String> checkAuth(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No Principal");
        }
        return ResponseEntity.ok("Authenticated as: " + principal.getName());
    }

    @PostMapping("/generate")
    @CacheEvict(value = "UserCoursesCache", key = "#principal.name")
    public ResponseEntity<?> generateCourse(@RequestBody GenerateCourseRequest request, Principal principal) {
        if (request.topic() == null || request.topic().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Topic is required"));
        }

        try {
            String email = principal.getName();
            Course course = courseGeneratorService.generateCourse(email, request.topic(), request.level());
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Generation failed: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<CourseResponseDTO>> getMyCourses(Principal principal) {
        return ResponseEntity.ok(self.getMyCoursesCached(principal.getName()));
    }

    @Cacheable(value = "UserCoursesCache", key = "#email", sync = true)
    public List<CourseResponseDTO> getMyCoursesCached(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Course> courses = courseRepository.findByStudentId(student.getId());
        return courses.stream()
                .map(CourseResponseDTO::fromEntity)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "UserCoursesCache", key = "#principal.name")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id, Principal principal) {
        String email = principal.getName();

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You do not own this course"));
        }

        courseRepository.delete(course);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }
}
