package com.practice.aiplatform.practice;

import com.practice.aiplatform.ai.GeminiService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.security.Principal;
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
    public Mono<ResponseEntity<Answer>> submitAnswer(@RequestBody SubmitAnswerRequest request, Principal principal) {

        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Question question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!question.getStudent().getId().equals(student.getId())) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }

        Answer newAnswer = new Answer();
        newAnswer.setAnswerText(request.answerText());
        newAnswer.setQuestion(question);
        newAnswer.setStudent(student);
        // Note: submittedAt is now handled by @PrePersist in the Answer entity

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
    public ResponseEntity<PracticeHistoryDto> getHistory(Principal principal) {

        // 1. Find the student using the simple findByEmail method
        Optional<Student> studentOptional = studentRepository.findByEmail(principal.getName());

        if (studentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Student student = studentOptional.get();

        // 2. Fetch all ANSWERS for this student (sorted by latest first)
        List<Answer> answers = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);

        // 3. Map the List<Answer> to the List<QuestionAnswerDto>
        List<PracticeHistoryDto.QuestionAnswerDto> historyList = answers.stream()
                .map(answer -> {
                    // Get the parent question for each answer
                    Question question = answer.getQuestion();

                    return new PracticeHistoryDto.QuestionAnswerDto(
                            question.getId(),
                            question.getQuestionText(),
                            question.getSubject(),
                            question.getTopic(),
                            question.getDifficulty(),
                            question.getGeneratedAt(),
                            answer.getAnswerText(),
                            answer.getIsCorrect(),
                            answer.getEvaluationStatus(),
                            answer.getHint(),
                            answer.getFeedback(),
                            answer.getSubmittedAt()
                    );
                })
                .toList();

        PracticeHistoryDto historyDto = new PracticeHistoryDto(
                student.getId(),
                student.getFirstName(),
                historyList
        );
        return ResponseEntity.ok(historyDto);
    }
}