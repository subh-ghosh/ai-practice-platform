package com.practice.aiplatform.ai;

import com.practice.aiplatform.practice.Question;
import com.practice.aiplatform.practice.QuestionRepository;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
// import com.practice.aiplatform.user.UsageService; // REMOVED to prevent errors
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
// import reactor.core.publisher.Mono; // REMOVED for stability

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin // Allows Frontend access
public class AiController {

    private final GeminiService geminiService;
    private final QuestionRepository questionRepository;
    private final StudentRepository studentRepository;
    // private final UsageService usageService; // REMOVED

    @Autowired
    public AiController(GeminiService geminiService,
                        QuestionRepository questionRepository,
                        StudentRepository studentRepository) {
        this.geminiService = geminiService;
        this.questionRepository = questionRepository;
        this.studentRepository = studentRepository;
        // this.usageService = usageService; // REMOVED
    }

    // --- DTOs (Defined inside to ensure compilation) ---
    public record GenerateQuestionRequest(String subject, String topic, String difficulty) {}
    public record HintRequest(Long questionId) {}

    // --- ENDPOINTS ---

    @PostMapping("/generate-question")
    public ResponseEntity<?> generateQuestion(@RequestBody GenerateQuestionRequest request, Principal principal) {
        try {
            String email = principal.getName();

            // 1. Find Student
            Student student = studentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + email));

            // 2. Generate Question (Blocking call for stability)
            // Note: If your GeminiService returns Mono<String>, we need to block(). 
            // If it returns String, this works as is. 
            // I am assuming standard String return based on context.
            // If GeminiService is reactive, append .block() at the end of the service call.
            String questionText = geminiService.generateQuestion(request.subject(), request.difficulty(), request.topic()).block(); 

            // 3. Save to DB
            Question newQuestion = new Question();
            newQuestion.setQuestionText(questionText);
            newQuestion.setStudent(student);
            newQuestion.setSubject(request.subject());
            newQuestion.setTopic(request.topic());
            newQuestion.setDifficulty(request.difficulty());
            
            Question savedQuestion = questionRepository.save(newQuestion);

            return ResponseEntity.ok(savedQuestion);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/get-hint")
    public ResponseEntity<?> getHint(@RequestBody HintRequest request) {
        try {
            Question question = questionRepository.findById(request.questionId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));

            String hint = geminiService.getHint(
                    question.getQuestionText(),
                    question.getSubject(),
                    question.getTopic(),
                    question.getDifficulty()
            ).block(); // Added .block() in case service is reactive

            return ResponseEntity.ok(hint);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error getting hint: " + e.getMessage());
        }
    }
}