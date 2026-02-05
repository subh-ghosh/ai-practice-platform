package com.practice.aiplatform.ai;

import com.practice.aiplatform.practice.Question;
import com.practice.aiplatform.practice.QuestionRepository;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import com.practice.aiplatform.user.UsageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.security.Principal;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin // 👈 CRITICAL: Allows Frontend access
public class AiController {

    private final GeminiService geminiService;
    private final QuestionRepository questionRepository;
    private final StudentRepository studentRepository;
    private final UsageService usageService;

    @Autowired
    public AiController(GeminiService geminiService,
                        QuestionRepository questionRepository,
                        StudentRepository studentRepository,
                        UsageService usageService) {
        this.geminiService = geminiService;
        this.questionRepository = questionRepository;
        this.studentRepository = studentRepository;
        this.usageService = usageService;
    }

    // --- DTOs (Defined here to ensure no "Class Not Found" errors) ---
    public record GenerateQuestionRequest(String subject, String topic, String difficulty) {}
    public record HintRequest(Long questionId) {}

    // --- ENDPOINTS ---

    @PostMapping("/generate-question")
    public Mono<ResponseEntity<Question>> generateQuestion(@RequestBody GenerateQuestionRequest request, Principal principal) {
        String email = principal.getName();

        // 1. Paywall Check
        if (!usageService.canPerformAction(email)) {
            return Mono.just(ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).build());
        }

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found with email: " + email));

        // 2. Generate and Save
        return geminiService.generateQuestion(request.subject(), request.difficulty(), request.topic())
                .flatMap(questionText -> {
                    Question newQuestion = new Question();
                    newQuestion.setQuestionText(questionText);
                    newQuestion.setStudent(student);
                    newQuestion.setSubject(request.subject());
                    newQuestion.setTopic(request.topic());
                    newQuestion.setDifficulty(request.difficulty());
                    
                    // Mark as generated (optional, depends on your Question entity)
                    // newQuestion.setGeneratedAt(java.time.LocalDateTime.now()); 

                    Question savedQuestion = questionRepository.save(newQuestion);
                    
                    // Optional: Increment usage here if your UsageService supports it
                    // usageService.incrementUsage(email);

                    return Mono.just(ResponseEntity.ok(savedQuestion));
                });
    }

    @PostMapping("/get-hint")
    public Mono<String> getHint(@RequestBody HintRequest request) {
        Question question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        return geminiService.getHint(
                question.getQuestionText(),
                question.getSubject(),
                question.getTopic(),
                question.getDifficulty()
        );
    }
}