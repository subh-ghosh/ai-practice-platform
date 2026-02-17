package com.practice.aiplatform.practice;

import com.practice.aiplatform.ai.GeminiService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import com.practice.aiplatform.user.UsageService;
import com.practice.aiplatform.studyplan.StudyPlanService; // Fusion Feature
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// DTO for the get-answer request
record GetAnswerRequest(Long questionId) {
}

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
    @Autowired
    private UsageService usageService;
    @Autowired
    private com.practice.aiplatform.gamification.XpService xpService;
    @Autowired
    private StudyPlanService studyPlanService; // Fusion Feature

    @PostMapping("/submit")
    public Mono<ResponseEntity<Answer>> submitAnswer(@RequestBody SubmitAnswerRequest request, Principal principal) {

        String email = principal.getName(); // 👈 --- GET EMAIL

        // --- 👇 ADD THIS PAYWALL CHECK ---
        if (!usageService.canPerformAction(email)) {
            // User has reached their free limit, return 402 Payment Required
            return Mono.just(ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).build());
        }
        // --- 👆 END OF PAYWALL CHECK ---

        Student student = studentRepository.findByEmail(email)
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

        Answer savedAnswer = answerRepository.save(newAnswer);

        // --- UPDATED METHOD CALL with context ---
        return geminiService.evaluateAnswer(
                question.getQuestionText(),
                savedAnswer.getAnswerText(),
                question.getSubject(),
                question.getTopic(),
                question.getDifficulty()).flatMap(feedback -> {
                    // ... (rest of the feedback parsing logic is unchanged)
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

                    // Fusion Feature: The Healer
                    // If answer is INCORRECT and difficulty is not Beginner, generate a recovery
                    // plan
                    if ("INCORRECT".equals(evaluationStatus)
                            && !"Beginner".equalsIgnoreCase(question.getDifficulty())) {
                        String recoveryMsg = "\n\n[The Healer] ❤️‍🩹 We detected some difficulty. A personalized 1-day Recovery Plan is being built for you. Check 'My Plans' in a few seconds!";
                        cleanFeedback += recoveryMsg;

                        // Fire-and-forget generation
                        studyPlanService.generateStudyPlan(
                                student.getEmail(),
                                question.getTopic() + " Recovery",
                                "Beginner",
                                1).subscribe();
                    }

                    savedAnswer.setFeedback(cleanFeedback);
                    savedAnswer.setHint(hint);
                    Answer finalAnswer = answerRepository.save(savedAnswer);

                    // Award XP
                    int planItemsCompleted = 0;
                    if (evaluationStatus.equals("CORRECT")) {
                        xpService.awardXp(student, 10);

                        // Fusion Feature: Smart Match
                        // Check if this practice fulfills a study plan item
                        planItemsCompleted = studyPlanService.markExternalPracticeAsComplete(
                                student.getEmail(),
                                question.getTopic(),
                                question.getDifficulty());
                    } else if (evaluationStatus.equals("CLOSE")) {
                        xpService.awardXp(student, 5);
                    }

                    // Append plan completion info to feedback for frontend toast
                    if (planItemsCompleted > 0) {
                        String planMsg = "\n\n[PLAN_UPDATE:" + planItemsCompleted + "]";
                        finalAnswer.setFeedback(finalAnswer.getFeedback() + planMsg);
                    }

                    return Mono.just(ResponseEntity.status(HttpStatus.CREATED).body(finalAnswer));
                });
    }

    @PostMapping("/get-answer")
    public Mono<ResponseEntity<Answer>> getAnswer(@RequestBody GetAnswerRequest request, Principal principal) {
        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Question question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!question.getStudent().getId().equals(student.getId())) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }

        // --- UPDATED METHOD CALL with context ---
        return geminiService.getCorrectAnswer(
                question.getQuestionText(),
                question.getSubject(),
                question.getTopic(),
                question.getDifficulty()).flatMap(answerText -> {
                    Answer newAnswer = new Answer();
                    newAnswer.setAnswerText(answerText); // The AI-generated answer
                    newAnswer.setQuestion(question);
                    newAnswer.setStudent(student);

                    newAnswer.setIsCorrect(false);
                    newAnswer.setEvaluationStatus("REVEALED");
                    newAnswer.setFeedback("This is the AI-generated correct answer.");
                    newAnswer.setHint(null);

                    Answer savedAnswer = answerRepository.save(newAnswer);

                    return Mono.just(ResponseEntity.status(HttpStatus.CREATED).body(savedAnswer));
                });
    }

    @GetMapping("/history")
    public ResponseEntity<PracticeHistoryDto> getHistory(Principal principal) {

        Optional<Student> studentOptional = studentRepository.findByEmail(principal.getName());

        if (studentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Student student = studentOptional.get();

        List<Answer> answers = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);

        List<PracticeHistoryDto.QuestionAnswerDto> historyList = answers.stream()
                .map(answer -> {
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
                            answer.getSubmittedAt());
                })
                .toList();

        PracticeHistoryDto historyDto = new PracticeHistoryDto(
                student.getId(),
                student.getFirstName(),
                historyList);
        return ResponseEntity.ok(historyDto);
    }

    @GetMapping("/suggestion") // Fusion Feature: Smart Suggestion
    public ResponseEntity<StudyPlanService.SuggestedPracticeDto> getSuggestion(Principal principal) {
        StudyPlanService.SuggestedPracticeDto suggestion = studyPlanService
                .getSuggestedPracticeItem(principal.getName());
        return ResponseEntity.ok(suggestion);
    }
}