package com.practice.aiplatform.ai;

import com.practice.aiplatform.practice.Question;
import com.practice.aiplatform.practice.QuestionRepository;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.security.Principal;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;
    private final QuestionRepository questionRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public AiController(GeminiService geminiService,
                        QuestionRepository questionRepository,
                        StudentRepository studentRepository) {
        this.geminiService = geminiService;
        this.questionRepository = questionRepository;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/generate-question")
    public Mono<Question> generateQuestion(@RequestBody GenerateQuestionRequest request, Principal principal) {

        String email = principal.getName();

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found with email: " + email));

        // --- UPDATED to pass all 3 fields ---
        return geminiService.generateQuestion(request.subject(), request.difficulty(), request.topic())
                .flatMap(questionText -> {
                    Question newQuestion = new Question();
                    newQuestion.setQuestionText(questionText);
                    newQuestion.setStudent(student);

                    Question savedQuestion = questionRepository.save(newQuestion);

                    return Mono.just(savedQuestion);
                });
    }
}