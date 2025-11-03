package com.practice.aiplatform.practice;

import com.practice.aiplatform.ai.GeminiService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono; // We still need this for GeminiService

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // We will use Optional, not Mono, for database calls

@RestController
@RequestMapping("/api/practice")
public class PracticeController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GeminiService geminiService;

    // --- THIS IS THE UPDATED METHOD ---
    // It now returns a simple ResponseEntity, not a Mono
    @PostMapping("/submit")
    public ResponseEntity<Answer> submitAnswer(@RequestBody SubmitAnswerRequest request) {

        // We will use a placeholder student for now.
        // In a real app, you'd get this from the security context.
        // .findById() returns an Optional, so we use .orElseThrow()
        Student student = studentRepository.findById(1L) // Placeholder: find student with ID 1
                .orElseThrow(() -> new RuntimeException("Placeholder student not found"));

        Question question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Check 1: Does this student own this question?
        if (!question.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Check 2: Has this question already been answered?
        if (question.getAnswer() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(question.getAnswer());
        }

        // 1. Create a new answer using the NO-ARGUMENT constructor
        Answer newAnswer = new Answer();

        // 2. Set the fields manually
        newAnswer.setAnswerText(request.answerText());
        newAnswer.setQuestion(question);
        newAnswer.setStudent(student);
        newAnswer.setSubmittedAt(LocalDateTime.now());

        // Save the initial answer (without feedback)
        // We save it here so we have an ID
        Answer savedAnswer = answerRepository.save(newAnswer);

        // Now, call AI for evaluation (asynchronous)
        // We call .block() to "wait" for the Mono to finish.
        String feedback = geminiService.evaluateAnswer(question.getQuestionText(), savedAnswer.getAnswerText())
                .block(); // This waits for the AI response

        // Parse AI Feedback
        boolean isCorrect;
        String cleanFeedback;

        if (feedback != null && feedback.startsWith("CORRECT:")) {
            isCorrect = true;
            cleanFeedback = feedback.substring("CORRECT:".length()).trim();
        } else if (feedback != null && feedback.startsWith("INCORRECT:")) {
            isCorrect = false;
            cleanFeedback = feedback.substring("INCORRECT:".length()).trim();
        } else {
            isCorrect = false; // Default to incorrect if format is wrong
            cleanFeedback = feedback;
        }

        // Update the answer with feedback
        savedAnswer.setIsCorrect(isCorrect);
        savedAnswer.setFeedback(cleanFeedback);

        // Save the updated answer
        Answer finalAnswer = answerRepository.save(savedAnswer);
        return ResponseEntity.status(HttpStatus.CREATED).body(finalAnswer);
    }

    // This method needs to be blocking too
    @GetMapping("/history")
    public ResponseEntity<PracticeHistoryDto> getHistory(@RequestParam Long studentId) {

        // Use .findById() which returns Optional
        Optional<Student> studentOptional = studentRepository.findById(studentId);

        if (studentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Student student = studentOptional.get();

        List<PracticeHistoryDto.QuestionAnswerDto> historyList = student.getQuestions().stream()
                .map(question -> new PracticeHistoryDto.QuestionAnswerDto(
                        question.getId(),
                        question.getQuestionText(),
                        question.getGeneratedAt(),
                        question.getAnswer() != null ? question.getAnswer().getAnswerText() : null,
                        question.getAnswer() != null ? question.getAnswer().getIsCorrect() : null,
                        question.getAnswer() != null ? question.getAnswer().getFeedback() : null,
                        question.getAnswer() != null ? question.getAnswer().getSubmittedAt() : null
                ))
                .toList();

        PracticeHistoryDto historyDto = new PracticeHistoryDto(
                student.getId(),
                student.getFirstName(),
                historyList
        );
        return ResponseEntity.ok(historyDto);
    }
}

