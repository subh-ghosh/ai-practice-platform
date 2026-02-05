package com.practice.aiplatform.ai;

import com.practice.aiplatform.practice.Question;
import com.practice.aiplatform.practice.QuestionRepository;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin
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

    // Define Records inside to avoid missing file errors
    public record GenerateQuestionRequest(String subject, String topic, String difficulty) {}
    public record HintRequest(Long questionId) {}

    @PostMapping("/generate-question")
    public ResponseEntity<?> generateQuestion(@RequestBody GenerateQuestionRequest request, Principal principal) {
        try {
            String email = principal.getName();
            Student student = studentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Assume generateQuestion returns a Mono, so we block() to get the String
            String questionText = geminiService.generateQuestion(
                request.subject(), 
                request.difficulty(), 
                request.topic()
            ).block(); 

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
            ).block();

            return ResponseEntity.ok(hint);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}