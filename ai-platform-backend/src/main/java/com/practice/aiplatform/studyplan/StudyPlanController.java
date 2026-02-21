package com.practice.aiplatform.studyplan;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/study-plans")
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    public StudyPlanController(StudyPlanService studyPlanService) {
        this.studyPlanService = studyPlanService;
    }

    public record GenerateStudyPlanRequest(String topic, String difficulty, int durationDays) {
    }

    public record QuizSubmission(Map<Long, String> answers) {
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateStudyPlan(@RequestBody GenerateStudyPlanRequest request, Principal principal) {
        if (request.topic() == null || request.topic().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Topic is required"));
        }

        String email = principal.getName();
        int duration = request.durationDays() > 0 ? request.durationDays() : 7;

        try {
            StudyPlan plan = studyPlanService.generateStudyPlan(email, request.topic(), request.difficulty(), duration);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Study plan generation failed: " + e.getMessage()));
        }
    }

    @PostMapping("/generate-from-syllabus")
    public ResponseEntity<?> generateStudyPlanFromSyllabus(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "durationDays", defaultValue = "7") int durationDays,
            Principal principal) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is required"));
        }

        String email = principal.getName();

        try {
            StudyPlan plan = studyPlanService.generateStudyPlanFromSyllabus(email, file, durationDays);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Study plan generation failed: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<StudyPlan>> getMyStudyPlans(Principal principal) {
        String email = principal.getName();
        List<StudyPlan> plans = studyPlanService.getStudyPlans(email);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStudyPlan(@PathVariable Long id) {
        try {
            StudyPlan plan = studyPlanService.getStudyPlan(id);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{planId}/items/{itemId}/complete")
    public ResponseEntity<?> markItemComplete(@PathVariable Long planId, @PathVariable Long itemId) {
        try {
            StudyPlanItem item = studyPlanService.markItemComplete(planId, itemId);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{planId}/items/{itemId}/quiz")
    public ResponseEntity<?> getQuizQuestions(@PathVariable Long planId, @PathVariable Long itemId) {
        try {
            List<QuizQuestion> questions = studyPlanService.getQuizQuestions(planId, itemId);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{planId}/items/{itemId}/quiz/submit")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Long planId,
            @PathVariable Long itemId,
            @RequestBody QuizSubmission submission) {
        try {
            StudyPlanService.QuizResult result =
                    studyPlanService.submitQuizAnswers(planId, itemId, submission.answers());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Principal principal) {
        try {
            StudyPlanService.StudyPlanStats stats = studyPlanService.getStats(principal.getName());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudyPlan(@PathVariable Long id, Principal principal) {
        try {
            studyPlanService.deleteStudyPlan(id, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Study plan deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/active-context")
    public ResponseEntity<?> getActiveContext(Principal principal) {
        try {
            StudyPlanService.ActiveContextDto context = studyPlanService.getActiveContext(principal.getName());
            if (context == null) {
                return ResponseEntity.ok(Map.of("active", false));
            }
            return ResponseEntity.ok(context);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("active", false));
        }
    }
}