package com.practice.aiplatform.practice;

import com.practice.aiplatform.ai.GeminiService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.security.Principal; // <-- IMPORT THIS
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    @PostMapping("/submit")
    // 1. Add "Principal principal"
    public Mono<ResponseEntity<Answer>> submitAnswer(@RequestBody SubmitAnswerRequest request, Principal principal) {

        // 2. Find the student by their email
        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Question question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!question.getStudent().getId().equals(student.getId())) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        if (question.getAnswer() != null) {
            return Mono.just(ResponseEntity.status(HttpStatus.CONFLICT).body(question.getAnswer()));
        }

        Answer newAnswer = new Answer();
        newAnswer.setAnswerText(request.answerText());
        newAnswer.setQuestion(question);
        newAnswer.setStudent(student); // Use the real student
        newAnswer.setSubmittedAt(LocalDateTime.now());
        Answer savedAnswer = answerRepository.save(newAnswer);

        return geminiService.evaluateAnswer(question.getQuestionText(), savedAnswer.getAnswerText())
                .flatMap(feedback -> {
                    String evaluationStatus;
                    String cleanFeedback = "";
                    String hint = null;

                    if (feedback == null || feedback.trim().isEmpty()) {
                        evaluationStatus = "INCORRECT";
                        cleanFeedback = "No response from AI.";
                    } else {
                        String[] lines = feedback.trim().split("\n", 2);
                        String firstLine = lines[0].trim().toUpperCase();
                        String restOfFeedback = (lines.length > 1) ? lines[1].trim() : "No feedback provided.";

                        if (firstLine.equals("CORRECT")) {
                            evaluationStatus = "CORRECT";
                            cleanFeedback = restOfFeedback;
                        } else if (firstLine.equals("CLOSE")) {
                            evaluationStatus = "CLOSE";
                            cleanFeedback = restOfFeedback;
                        } else {
                            evaluationStatus = "INCORRECT";
                            cleanFeedback = (lines.length > 1) ? feedback : "No feedback provided.";
                        }

                        if (!evaluationStatus.equals("CORRECT")) {
                            String hintMarker = "[HINT]";
                            int hintIndex = cleanFeedback.toUpperCase().indexOf(hintMarker);

                            if (hintIndex != -1) {
                                hint = cleanFeedback.substring(hintIndex + hintMarker.length()).trim();
                                cleanFeedback = cleanFeedback.substring(0, hintIndex).trim();
                            }
                        }
                    }

                    savedAnswer.setIsCorrect(evaluationStatus.equals("CORRECT"));
                    savedAnswer.setEvaluationStatus(evaluationStatus);
                    savedAnswer.setFeedback(cleanFeedback);
                    savedAnswer.setHint(hint);
                    Answer finalAnswer = answerRepository.save(savedAnswer);

                    return Mono.just(ResponseEntity.status(HttpStatus.CREATED).body(finalAnswer));
                });
    }

    @GetMapping("/history")
    // 1. Change studentId param to "Principal principal"
    public ResponseEntity<PracticeHistoryDto> getHistory(Principal principal) {

        // 2. Find the student using the new method
        Optional<Student> studentOptional = studentRepository.findByEmailWithHistory(principal.getName());

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