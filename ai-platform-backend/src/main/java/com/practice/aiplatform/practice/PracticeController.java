package com.practice.aiplatform.practice;

import com.practice.aiplatform.ai.AiService;
import com.practice.aiplatform.studyplan.StudyPlanService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import com.practice.aiplatform.user.UsageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
    private AiService aiService;
    @Autowired
    private UsageService usageService;
    @Autowired
    private com.practice.aiplatform.gamification.XpService xpService;
    @Autowired
    private StudyPlanService studyPlanService;

    @PostMapping("/submit")
    @Caching(evict = {
            @CacheEvict(value = "UserRecommendationsCache", key = "#principal.name"),
            @CacheEvict(value = "PredictSuccessCache", allEntries = true),
            @CacheEvict(value = "UserStatsSummaryCache", key = "#principal.name"),
            @CacheEvict(value = "UserStatsTimeSeriesCache", key = "#principal.name"),
            @CacheEvict(value = "UserStatsRecommendationsCache", key = "#principal.name")
    })
    public ResponseEntity<Answer> submitAnswer(@RequestBody SubmitAnswerRequest request, Principal principal) {
        String email = principal.getName();

        if (!usageService.canPerformAction(email)) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).build();
        }

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Question question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!question.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Answer savedAnswer = saveInitialAnswer(student, question, request.answerText());

        String aiFeedback = aiService.evaluateAnswer(
                question.getQuestionText(),
                savedAnswer.getAnswerText(),
                question.getSubject(),
                question.getTopic(),
                question.getDifficulty()
        );

        ParsedFeedback parsedFeedback = parseFeedback(aiFeedback);

        savedAnswer.setIsCorrect("CORRECT".equals(parsedFeedback.status));
        savedAnswer.setEvaluationStatus(parsedFeedback.status);

        String finalFeedback = parsedFeedback.feedbackText;

        if ("INCORRECT".equals(parsedFeedback.status) && !"Beginner".equalsIgnoreCase(question.getDifficulty())) {
            finalFeedback += "\n\n[The Healer] We detected difficulty. A simple 1-day recovery plan was created.";
            studyPlanService.generateStudyPlan(
                    student.getEmail(),
                    question.getTopic() + " Recovery",
                    "Beginner",
                    1
            );
        }

        savedAnswer.setFeedback(finalFeedback);
        savedAnswer.setHint(parsedFeedback.hint);

        Answer finalAnswer = answerRepository.save(savedAnswer);

        int planItemsCompleted = handleXpAndPlanProgress(student, question, parsedFeedback.status);

        if (planItemsCompleted > 0) {
            finalAnswer.setFeedback(finalAnswer.getFeedback() + "\n\n[PLAN_UPDATE:" + planItemsCompleted + "]");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(finalAnswer);
    }

    @PostMapping("/get-answer")
    public ResponseEntity<Answer> getAnswer(@RequestBody GetAnswerRequest request, Principal principal) {
        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Question question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!question.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String answerText = aiService.getCorrectAnswer(
                question.getQuestionText(),
                question.getSubject(),
                question.getTopic(),
                question.getDifficulty()
        );

        Answer answer = new Answer();
        answer.setAnswerText(answerText);
        answer.setQuestion(question);
        answer.setStudent(student);
        answer.setIsCorrect(false);
        answer.setEvaluationStatus("REVEALED");
        answer.setFeedback("This is the AI-generated correct answer.");
        answer.setHint(null);

        Answer savedAnswer = answerRepository.save(answer);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAnswer);
    }

    @GetMapping("/history")
    public ResponseEntity<PracticeHistoryDto> getHistory(Principal principal) {
        Optional<Student> studentOptional = studentRepository.findByEmail(principal.getName());
        if (studentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Student student = studentOptional.get();
        List<Answer> answers = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);

        List<PracticeHistoryDto.QuestionAnswerDto> historyList = new ArrayList<>();
        for (Answer answer : answers) {
            Question question = answer.getQuestion();

            PracticeHistoryDto.QuestionAnswerDto item = new PracticeHistoryDto.QuestionAnswerDto(
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

            historyList.add(item);
        }

        PracticeHistoryDto historyDto = new PracticeHistoryDto(
                student.getId(),
                student.getFirstName(),
                historyList
        );

        return ResponseEntity.ok(historyDto);
    }

    @GetMapping("/suggestion")
    public ResponseEntity<StudyPlanService.SuggestedPracticeDto> getSuggestion(Principal principal) {
        StudyPlanService.SuggestedPracticeDto suggestion =
                studyPlanService.getSuggestedPracticeItem(principal.getName());
        return ResponseEntity.ok(suggestion);
    }

    private Answer saveInitialAnswer(Student student, Question question, String answerText) {
        Answer answer = new Answer();
        answer.setAnswerText(answerText);
        answer.setQuestion(question);
        answer.setStudent(student);
        return answerRepository.save(answer);
    }

    private int handleXpAndPlanProgress(Student student, Question question, String status) {
        int planItemsCompleted = 0;

        if ("CORRECT".equals(status)) {
            xpService.awardXp(student, 10);
            planItemsCompleted = studyPlanService.markExternalPracticeAsComplete(
                    student.getEmail(),
                    question.getTopic(),
                    question.getDifficulty()
            );
        } else if ("CLOSE".equals(status)) {
            xpService.awardXp(student, 5);
        }

        return planItemsCompleted;
    }

    private ParsedFeedback parseFeedback(String rawFeedback) {
        if (rawFeedback == null || rawFeedback.trim().isEmpty()) {
            return new ParsedFeedback("INCORRECT", "No response from AI.", null);
        }

        String status = "INCORRECT";
        String feedbackText = rawFeedback;
        String hint = null;

        String[] lines = rawFeedback.trim().split("\n", 2);
        String firstLine = lines[0].trim().toUpperCase();

        if ("CORRECT".equals(firstLine) || "CLOSE".equals(firstLine) || "INCORRECT".equals(firstLine)) {
            status = firstLine;
            feedbackText = lines.length > 1 ? lines[1].trim() : "No feedback provided.";
        }

        if (!"CORRECT".equals(status)) {
            String hintMarker = "[HINT]";
            int hintIndex = feedbackText.toUpperCase().indexOf(hintMarker);

            if (hintIndex != -1) {
                hint = feedbackText.substring(hintIndex + hintMarker.length()).trim();
                feedbackText = feedbackText.substring(0, hintIndex).trim();
            }
        }

        return new ParsedFeedback(status, feedbackText, hint);
    }

    private static class ParsedFeedback {
        String status;
        String feedbackText;
        String hint;

        ParsedFeedback(String status, String feedbackText, String hint) {
            this.status = status;
            this.feedbackText = feedbackText;
            this.hint = hint;
        }
    }
}