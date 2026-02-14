package com.practice.aiplatform.studyplan;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.practice.aiplatform.ai.GeminiService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudyPlanService {

    private static final int VIDEO_XP = 10;
    private static final int PRACTICE_XP = 50;
    private static final int QUESTIONS_PER_PRACTICE = 5;

    private final GeminiService geminiService;
    private final YouTubeService youTubeService;
    private final StudyPlanRepository studyPlanRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;

    public StudyPlanService(GeminiService geminiService,
            YouTubeService youTubeService,
            StudyPlanRepository studyPlanRepository,
            QuizQuestionRepository quizQuestionRepository,
            StudentRepository studentRepository,
            ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.youTubeService = youTubeService;
        this.studyPlanRepository = studyPlanRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.studentRepository = studentRepository;
        this.objectMapper = objectMapper;
    }

    public Mono<StudyPlan> generateStudyPlan(String userEmail, String topic, String difficulty, int durationDays) {
        return Mono.fromCallable(() -> {
            Student student = studentRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Step 1: Search YouTube for relevant videos
            int maxVideos = Math.min(durationDays * 3, 25);
            List<Map<String, String>> videos = youTubeService.searchVideos(
                    topic + " " + difficulty + " tutorial", maxVideos);

            if (videos.isEmpty()) {
                throw new RuntimeException("No videos found for the topic: " + topic);
            }

            // Step 2: Build AI prompt with video data
            String prompt = createPrompt(topic, difficulty, durationDays, videos);

            // Step 3: Call AI to curate and organize
            String aiResponse = geminiService.generateRawContent(prompt).block();

            // Step 4: Parse and save the plan structure
            StudyPlan plan = parseAndSavePlan(aiResponse, student, topic, difficulty, durationDays, videos);

            // Step 5: Generate quiz questions for each PRACTICE item
            generateQuizQuestionsForPlan(plan, topic, difficulty);

            return plan;
        });
    }

    /**
     * Generate 5 MCQ quiz questions for each PRACTICE item in the plan.
     */
    private void generateQuizQuestionsForPlan(StudyPlan plan, String topic, String difficulty) {
        for (StudyPlanItem item : plan.getItems()) {
            if ("PRACTICE".equals(item.getItemType())) {
                try {
                    String quizPrompt = createQuizPrompt(
                            item.getPracticeSubject() != null ? item.getPracticeSubject() : topic,
                            item.getPracticeTopic() != null ? item.getPracticeTopic() : topic,
                            item.getPracticeDifficulty() != null ? item.getPracticeDifficulty() : difficulty);

                    String quizResponse = geminiService.generateRawContent(quizPrompt).block();
                    List<QuizQuestion> questions = parseQuizQuestions(quizResponse, item);

                    quizQuestionRepository.saveAll(questions);
                    item.getQuizQuestions().addAll(questions);

                } catch (Exception e) {
                    System.err.println("Failed to generate quiz for item " + item.getId() + ": " + e.getMessage());
                    // Don't fail the whole plan if one quiz fails
                }
            }
        }
    }

    private String createQuizPrompt(String subject, String practiceTopic, String difficulty) {
        return String.format(
                """
                        Generate exactly 5 multiple choice questions for a %s level student on the subject of %s, specifically on the topic: %s.

                        Return ONLY valid JSON with this exact structure:
                        {
                          "questions": [
                            {
                              "question": "The question text",
                              "optionA": "First option",
                              "optionB": "Second option",
                              "optionC": "Third option",
                              "optionD": "Fourth option",
                              "correctOption": "A"
                            }
                          ]
                        }

                        Rules:
                        - Generate exactly 5 questions
                        - Each question must have exactly 4 options (A, B, C, D)
                        - correctOption must be one of: "A", "B", "C", "D"
                        - Questions should test understanding, not just memorization
                        - Make wrong answers plausible but clearly wrong to a student who studied
                        - Do not include Markdown formatting (like ```json), just the raw JSON
                        """,
                difficulty, subject, practiceTopic);
    }

    private List<QuizQuestion> parseQuizQuestions(String jsonResponse, StudyPlanItem item) {
        List<QuizQuestion> questions = new ArrayList<>();
        try {
            String cleanJson = jsonResponse.replace("```json", "").replace("```", "").trim();
            JsonNode root = objectMapper.readTree(cleanJson);
            JsonNode questionsNode = root.path("questions");

            if (questionsNode.isArray()) {
                for (JsonNode qNode : questionsNode) {
                    QuizQuestion q = new QuizQuestion();
                    q.setQuestionText(qNode.path("question").asText(""));
                    q.setOptionA(qNode.path("optionA").asText(""));
                    q.setOptionB(qNode.path("optionB").asText(""));
                    q.setOptionC(qNode.path("optionC").asText(""));
                    q.setOptionD(qNode.path("optionD").asText(""));
                    q.setCorrectOption(qNode.path("correctOption").asText("A").toUpperCase());
                    q.setStudyPlanItem(item);
                    questions.add(q);
                }
            }
        } catch (Exception e) {
            System.err.println("Quiz parsing error: " + e.getMessage());
        }
        return questions;
    }

    // ===== QUIZ SUBMISSION =====

    public record QuizResult(int totalQuestions, int correctCount, int xpEarned, boolean passed,
            List<QuestionResult> results) {
    }

    public record QuestionResult(Long questionId, String correctOption, boolean isCorrect) {
    }

    /**
     * Submit quiz answers for a PRACTICE item.
     * Returns results with XP earned.
     * Item is marked complete only when all questions are correct.
     */
    public QuizResult submitQuizAnswers(Long planId, Long itemId, Map<Long, String> answers) {
        StudyPlan plan = studyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Study plan not found"));

        StudyPlanItem item = plan.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in this plan"));

        if (!"PRACTICE".equals(item.getItemType())) {
            throw new RuntimeException("This item is not a practice checkpoint");
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByStudyPlanItemId(itemId);
        List<QuestionResult> results = new ArrayList<>();
        int correctCount = 0;

        for (QuizQuestion q : questions) {
            String submittedAnswer = answers.getOrDefault(q.getId(), "").toUpperCase();
            boolean isCorrect = q.getCorrectOption().equalsIgnoreCase(submittedAnswer);
            if (isCorrect)
                correctCount++;
            results.add(new QuestionResult(q.getId(), q.getCorrectOption(), isCorrect));
        }

        int xpEarned = 0;
        boolean passed = correctCount == questions.size();

        if (passed && !item.isCompleted()) {
            // Mark item complete and award XP
            item.setCompleted(true);
            xpEarned = PRACTICE_XP;

            // Award XP to student
            Student student = plan.getStudent();
            student.setTotalXp(student.getTotalXp() + xpEarned);
            studentRepository.save(student);

            // Recalculate plan progress
            recalculateProgress(plan);
            studyPlanRepository.save(plan);
        }

        return new QuizResult(questions.size(), correctCount, xpEarned, passed, results);
    }

    /**
     * Get quiz questions for an item (without correct answers —
     * they're @JsonIgnore).
     */
    public List<QuizQuestion> getQuizQuestions(Long planId, Long itemId) {
        // Verify item belongs to plan
        StudyPlan plan = studyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Study plan not found"));

        plan.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in this plan"));

        return quizQuestionRepository.findByStudyPlanItemId(itemId);
    }

    // ===== MARK VIDEO COMPLETE =====

    public StudyPlanItem markItemComplete(Long planId, Long itemId) {
        StudyPlan plan = studyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Study plan not found"));

        StudyPlanItem item = plan.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in this plan"));

        // PRACTICE items with quiz questions must be completed through quizzes
        if ("PRACTICE".equals(item.getItemType())) {
            List<QuizQuestion> questions = quizQuestionRepository.findByStudyPlanItemId(itemId);
            if (!questions.isEmpty()) {
                throw new RuntimeException("Practice items with quizzes must be completed through the quiz");
            }
            // Legacy PRACTICE items without quiz questions can be marked complete manually
        }

        if (!item.isCompleted()) {
            item.setCompleted(true);

            // Award XP
            int xp = item.getXpReward() > 0 ? item.getXpReward() : VIDEO_XP;
            Student student = plan.getStudent();
            student.setTotalXp(student.getTotalXp() + xp);
            studentRepository.save(student);

            recalculateProgress(plan);
            studyPlanRepository.save(plan);
        }

        return item;
    }

    // ===== STATS =====

    public record StudyPlanStats(int activePlans, int completedPlans, int totalXp, int totalItemsCompleted) {
    }

    public StudyPlanStats getStats(String userEmail) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<StudyPlan> plans = studyPlanRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());

        int active = 0, completed = 0, itemsCompleted = 0;
        for (StudyPlan plan : plans) {
            if (plan.isCompleted()) {
                completed++;
            } else {
                active++;
            }
            itemsCompleted += plan.getItems().stream().filter(StudyPlanItem::isCompleted).count();
        }

        return new StudyPlanStats(active, completed, student.getTotalXp(), itemsCompleted);
    }

    // ===== HELPERS =====

    private void recalculateProgress(StudyPlan plan) {
        long totalItems = plan.getItems().size();
        long completedItems = plan.getItems().stream().filter(StudyPlanItem::isCompleted).count();
        int progress = totalItems > 0 ? (int) ((completedItems * 100) / totalItems) : 0;
        plan.setProgress(progress);
        plan.setCompleted(progress == 100);
    }

    public List<StudyPlan> getStudyPlans(String userEmail) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return studyPlanRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
    }

    public StudyPlan getStudyPlan(Long id) {
        return studyPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Study plan not found"));
    }

    // ===== PLAN GENERATION HELPERS (unchanged) =====

    private String createPrompt(String topic, String difficulty, int durationDays, List<Map<String, String>> videos) {
        StringBuilder videoList = new StringBuilder();
        for (int i = 0; i < videos.size(); i++) {
            Map<String, String> v = videos.get(i);
            videoList.append(String.format(
                    "  %d. videoId=\"%s\", title=\"%s\", channel=\"%s\", duration=\"%s\"\n",
                    i + 1, v.get("videoId"), v.get("title"), v.get("channelTitle"), v.get("duration")));
        }

        return String.format(
                """
                        You are an expert curriculum designer. Create a structured study plan for a "%s" level student learning "%s" over %d days.

                        Here are videos available for this topic:
                        %s

                        Your task:
                        1. Select the BEST and most relevant videos from the list above (you don't have to use all of them)
                        2. Organize them into a day-by-day schedule across %d days
                        3. After every 2-3 videos, insert a PRACTICE checkpoint where the student should practice what they learned
                        4. For each practice checkpoint, specify the subject, topic, and difficulty for generating practice questions

                        Return ONLY valid JSON with this exact structure:
                        {
                          "title": "Study Plan Title",
                          "description": "Brief description of what will be learned",
                          "days": [
                            {
                              "dayNumber": 1,
                              "items": [
                                {
                                  "type": "VIDEO",
                                  "videoId": "the_video_id_from_list",
                                  "description": "Brief context about why this video and what to focus on"
                                },
                                {
                                  "type": "PRACTICE",
                                  "practiceSubject": "The subject area",
                                  "practiceTopic": "Specific topic to practice",
                                  "practiceDifficulty": "%s",
                                  "description": "Practice the concepts from the previous videos"
                                }
                              ]
                            }
                          ]
                        }

                        Rules:
                        - Use ONLY videoId values from the provided list
                        - Each day should have 2-4 items total
                        - Always end a day with a PRACTICE checkpoint
                        - Make descriptions helpful and specific
                        - Distribute content evenly across all %d days
                        Do not include Markdown formatting (like ```json), just the raw JSON.
                        """,
                difficulty, topic, durationDays, videoList.toString(),
                durationDays, difficulty, durationDays);
    }

    private StudyPlan parseAndSavePlan(String jsonResponse, Student student,
            String topic, String difficulty, int durationDays,
            List<Map<String, String>> videos) {
        try {
            String cleanJson = jsonResponse.replace("```json", "").replace("```", "").trim();
            JsonNode root = objectMapper.readTree(cleanJson);

            Map<String, Map<String, String>> videoMap = videos.stream()
                    .collect(Collectors.toMap(v -> v.get("videoId"), v -> v));

            StudyPlan plan = new StudyPlan();
            plan.setTitle(root.path("title").asText("Study Plan: " + topic));
            plan.setDescription(root.path("description").asText(""));
            plan.setTopic(topic);
            plan.setDifficulty(difficulty);
            plan.setDurationDays(durationDays);
            plan.setStudent(student);
            plan.setCreatedAt(LocalDateTime.now());

            int globalOrder = 1;
            JsonNode days = root.path("days");
            if (days.isArray()) {
                for (JsonNode day : days) {
                    int dayNumber = day.path("dayNumber").asInt(1);
                    JsonNode dayItems = day.path("items");

                    if (dayItems.isArray()) {
                        for (JsonNode itemNode : dayItems) {
                            StudyPlanItem item = new StudyPlanItem();
                            String type = itemNode.path("type").asText("VIDEO");
                            item.setItemType(type);
                            item.setDayNumber(dayNumber);
                            item.setOrderIndex(globalOrder++);
                            item.setDescription(itemNode.path("description").asText(""));

                            if ("VIDEO".equals(type)) {
                                String videoId = itemNode.path("videoId").asText("");
                                Map<String, String> videoData = videoMap.get(videoId);

                                if (videoData != null) {
                                    item.setVideoId(videoId);
                                    item.setTitle(videoData.get("title"));
                                    item.setVideoUrl("https://www.youtube.com/watch?v=" + videoId);
                                    item.setThumbnailUrl(videoData.get("thumbnailUrl"));
                                    item.setChannelName(videoData.get("channelTitle"));
                                    item.setVideoDuration(videoData.get("duration"));
                                } else {
                                    System.err.println("Warning: Unknown videoId from AI: " + videoId);
                                    continue;
                                }
                                item.setXpReward(VIDEO_XP);
                            } else if ("PRACTICE".equals(type)) {
                                item.setTitle("Checkpoint: " + itemNode.path("practiceTopic").asText(topic));
                                item.setPracticeSubject(itemNode.path("practiceSubject").asText(topic));
                                item.setPracticeTopic(itemNode.path("practiceTopic").asText(topic));
                                item.setPracticeDifficulty(
                                        itemNode.path("practiceDifficulty").asText(difficulty));
                                item.setXpReward(PRACTICE_XP);
                            }

                            plan.addItem(item);
                        }
                    }
                }
            }

            return studyPlanRepository.save(plan);

        } catch (Exception e) {
            System.err.println("Study Plan Parsing Error: " + e.getMessage());
            System.err.println("Raw Response: " + jsonResponse);
            throw new RuntimeException("Failed to parse study plan response: " + e.getMessage());
        }
    }
}
