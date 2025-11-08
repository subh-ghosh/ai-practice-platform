package com.practice.aiplatform.ai;

import com.practice.aiplatform.practice.Question;
import com.practice.aiplatform.practice.QuestionRepository;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import com.practice.aiplatform.user.UsageService; // 👈 --- ADD THIS IMPORT
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // 👈 --- ADD THIS IMPORT
import org.springframework.http.ResponseEntity; // 👈 --- ADD THIS IMPORT
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.security.Principal;

// DTO for the hint request
record HintRequest(Long questionId) {}

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;
    private final QuestionRepository questionRepository;
    private final StudentRepository studentRepository;
    private final UsageService usageService; // 👈 --- ADD THIS

    @Autowired
    public AiController(GeminiService geminiService,
                        QuestionRepository questionRepository,
                        StudentRepository studentRepository,
                        UsageService usageService) { // 👈 --- ADD THIS
        this.geminiService = geminiService;
        this.questionRepository = questionRepository;
        this.studentRepository = studentRepository;
        this.usageService = usageService; // 👈 --- ADD THIS
    }

    @PostMapping("/generate-question")
    public Mono<ResponseEntity<Question>> generateQuestion(@RequestBody GenerateQuestionRequest request, Principal principal) { // 👈 --- Change return type
        String email = principal.getName();

        // --- 👇 ADD THIS PAYWALL CHECK ---
        if (!usageService.canPerformAction(email)) {
            // User has reached their free limit, return 402 Payment Required
            return Mono.just(ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).build());
        }
        // --- 👆 END OF PAYWALL CHECK ---

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found with email: " + email));

        return geminiService.generateQuestion(request.subject(), request.difficulty(), request.topic())
                .flatMap(questionText -> {
                    Question newQuestion = new Question();
                    newQuestion.setQuestionText(questionText);
                    newQuestion.setStudent(student);
                    newQuestion.setSubject(request.subject());
                    newQuestion.setTopic(request.topic());
                    newQuestion.setDifficulty(request.difficulty());
                    Question savedQuestion = questionRepository.save(newQuestion);
                    return Mono.just(ResponseEntity.ok(savedQuestion)); // 👈 --- Wrap in ResponseEntity
                });
    }

    @PostMapping("/get-hint")
    public Mono<String> getHint(@RequestBody HintRequest request) {
        Question question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // --- UPDATED METHOD CALL ---
        return geminiService.getHint(
                question.getQuestionText(),
                question.getSubject(),
                question.getTopic(),
                question.getDifficulty()
        );
    }
}