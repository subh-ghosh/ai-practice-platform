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
    private final StudyPlanItemRepository studyPlanItemRepository; // Fusion Feature
    private final QuizQuestionRepository quizQuestionRepository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;

    public StudyPlanService(GeminiService geminiService,
            YouTubeService youTubeService,
            StudyPlanRepository studyPlanRepository,
            StudyPlanItemRepository studyPlanItemRepository,
            QuizQuestionRepository quizQuestionRepository,
            StudentRepository studentRepository,
            ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.youTubeService = youTubeService;
        this.studyPlanRepository = studyPlanRepository;
        this.studyPlanItemRepository = studyPlanItemRepository;
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
        // Filter for practice items first
        List<StudyPlanItem> practiceItems = plan.getItems().stream()
                .filter(item -> "PRACTICE".equals(item.getItemType()))
                .toList();

        // Process in parallel to avoid timeout
        // Using common ForkJoinPool which is suitable for this scale (3-5 threads
        // usually)
        practiceItems.parallelStream().forEach(item -> {
            try {
                String quizPrompt = createQuizPrompt(
                        item.getPracticeSubject() != null ? item.getPracticeSubject() : topic,
                        item.getPracticeTopic() != null ? item.getPracticeTopic() : topic,
                        item.getPracticeDifficulty() != null ? item.getPracticeDifficulty() : difficulty);

                String quizResponse = geminiService.generateRawContent(quizPrompt).block();
                List<QuizQuestion> questions = parseQuizQuestions(quizResponse, item);

                if (!questions.isEmpty()) {
                    quizQuestionRepository.saveAll(questions);
                    // No need to add to item.getQuizQuestions() here as it's not
                    // transactional/managed in this context
                    // and we are returning the plan which was already saved.
                    // However, if we want the returned plan to include them, we should:
                    synchronized (item) {
                        item.getQuizQuestions().addAll(questions);
                    }
                }

            } catch (Exception e) {
                System.err.println("Failed to generate quiz for item " + item.getId() + ": " + e.getMessage());
                // Don't fail the whole plan if one quiz fails
            }
        });
    }

    private String createQuizPrompt(String subject, String practiceTopic, String difficulty) {
        return String.format(
                """
                        Generate exactly %d multiple choice questions for a %s level student on the subject of %s, specifically on the topic: %s.

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
                        - Generate exactly %d questions
                        - Each question must have exactly 4 options (A, B, C, D)
                        - correctOption must be one of: "A", "B", "C", "D"
                        - Questions should test understanding, not just memorization
                        - Make wrong answers plausible but clearly wrong to a student who studied
                        - Do not include Markdown formatting (like ```json), just the raw JSON
                        """,
                QUESTIONS_PER_PRACTICE, difficulty, subject, practiceTopic, QUESTIONS_PER_PRACTICE);
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
        // Fusion Feature: Gatekeeper - Pass if score >= 80%
        double score = (double) correctCount / questions.size();
        boolean passed = score >= 0.8;

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
                                  "description": "Brief context about why this video and what to focus on",
                                  "practiceTopic": "Specific concept covered in this video (e.g. 'Variables' not the video title)"
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

                                    // Fusion Feature: Clean Topics for Practice
                                    String cleanTopic = itemNode.path("practiceTopic").asText(topic);
                                    item.setPracticeTopic(cleanTopic);
                                    item.setPracticeSubject(topic); // Use main plan topic as subject
                                    item.setPracticeDifficulty(difficulty);
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

    public void deleteStudyPlan(Long id, String userEmail) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        StudyPlan plan = studyPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Study plan not found"));

        if (!plan.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("You do not have permission to delete this study plan");
        }

        studyPlanRepository.delete(plan);
    }

    // ===== SMART SUGGESTION (Fusion Feature) =====

    public record SuggestedPracticeDto(String topic, String subject, String difficulty, Long planId, Long itemId) {
    }

    public SuggestedPracticeDto getSuggestedPracticeItem(String userEmail) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<StudyPlanItem> nextItems = studyPlanItemRepository.findNextPracticeItems(student.getId());

        if (nextItems.isEmpty()) {
            return null;
        }

        StudyPlanItem nextItem = nextItems.get(0);
        return new SuggestedPracticeDto(
                nextItem.getPracticeTopic(),
                nextItem.getPracticeSubject(),
                nextItem.getPracticeDifficulty(),
                nextItem.getStudyPlan().getId(),
                nextItem.getId());
    }

    // Fusion Feature: Smart Match
    // If a student practices a topic externally, mark it complete in the plan
    // Returns the number of items marked complete
    public int markExternalPracticeAsComplete(String userEmail, String topic, String difficulty) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Find items that match topic AND are incomplete
        List<StudyPlanItem> matches = studyPlanItemRepository.findMatchingIncompleteItems(student.getId(), topic);

        int completed = 0;
        for (StudyPlanItem item : matches) {
            item.setCompleted(true);
            completed++;

            int xp = item.getXpReward() > 0 ? item.getXpReward() : PRACTICE_XP;
            student.setTotalXp(student.getTotalXp() + xp);

            recalculateProgress(item.getStudyPlan());
            studyPlanRepository.save(item.getStudyPlan());
        }
        studentRepository.save(student);
        return completed;
    }

    // ===== Active Context for Practice Page Fusion =====

    public record ActiveContextDto(
            Long planId,
            String planTitle,
            int progress,
            int currentDay,
            int totalDays,
            List<ActiveContextItemDto> todayItems,
            SuggestedPracticeDto nextPractice) {
    }

    public record ActiveContextItemDto(
            Long itemId,
            String title,
            String type,
            boolean isCompleted,
            String practiceTopic,
            String practiceSubject,
            String practiceDifficulty) {
    }

    // ===== SYLLABUS UPLOAD FEATURE =====

    public Mono<StudyPlan> generateStudyPlanFromSyllabus(String userEmail,
            org.springframework.web.multipart.MultipartFile file, int durationDays) {
        return Mono.fromCallable(() -> {
            Student student = studentRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Step 1: Analyze Syllabus & Extract Structure
            String mimeType = file.getContentType();
            byte[] fileData = file.getBytes();

            String analysisPrompt = String.format(
                    """
                            Analyze this syllabus/document thoroughly. Your goal is to create a COMPREHENSIVE day-by-day study schedule for exactly %d days that guarantees 100%% coverage of all course material.

                            Strict Instructions:
                            1. Identify EVERY individual topic and sub-topic mentioned in the syllabus.
                            2. Ensure that EVERY identified sub-topic has AT LEAST one dedicated lesson with its own YouTube video search query.
                            3. Distribute these lessons across %d days. Every day must have content.
                            4. Instruction for YouTube Search Queries:
                               - Refine each query to prefer long-duration videos (e.g., append "full course", "comprehensive lecture", or "full length").
                               - Strongly prefer "whiteboard" style explanations (e.g., append "whiteboard tutorial").
                               - Include "lecture" in the query where appropriate.
                               - Try to identify a top-tier educator for this subject from the syllabus and use them consistently for multiple related topics to maintain teaching style continuity.

                            Return ONLY valid JSON with this structure:
                            {
                              "title": "Full Course Title",
                              "description": "Comprehensive Course Description",
                              "difficulty": "Intermediate",
                              "days": [
                                {
                                  "dayNumber": 1,
                                  "lessons": [
                                    {
                                      "title": "Specific Topic Title",
                                      "searchQuery": "refined search query favoring long whiteboard lectures and educator consistency",
                                      "description": "What the student will learn"
                                    }
                                  ]
                                }
                              ]
                            }
                            """,
                    durationDays, durationDays);

            String analysisResponse = geminiService.generateRawContent(analysisPrompt, mimeType, fileData).block();
            JsonNode syllabusNode = parseJson(analysisResponse);

            String title = syllabusNode.path("title").asText("Custom Study Plan");
            String description = syllabusNode.path("description").asText("Generated from uploaded syllabus");
            String difficulty = syllabusNode.path("difficulty").asText("Beginner");
            JsonNode daysNode = syllabusNode.path("days");

            if (!daysNode.isArray() || daysNode.isEmpty()) {
                throw new RuntimeException("Could not extract a valid day-by-day schedule from the syllabus.");
            }

            // Step 2: Search Videos for EACH Lesson and create plan items
            List<StudyPlanItem> allItems = new ArrayList<>();
            int itemOrder = 1;

            for (JsonNode day : daysNode) {
                int dayNumber = day.path("dayNumber").asInt();
                JsonNode lessons = day.path("lessons");

                if (lessons.isArray()) {
                    for (JsonNode lesson : lessons) {
                        String lessonTitle = lesson.path("title").asText();
                        String searchQuery = lesson.path("searchQuery").asText();
                        String lessonDesc = lesson.path("description").asText();

                        // Search for 1 specific high-quality video for this lesson
                        List<Map<String, String>> videos = youTubeService.searchVideos(searchQuery, 1);

                        if (!videos.isEmpty()) {
                            Map<String, String> video = videos.get(0);
                            StudyPlanItem item = new StudyPlanItem();
                            item.setItemType("VIDEO");
                            item.setDayNumber(dayNumber);
                            item.setOrderIndex(itemOrder++);
                            item.setDescription(lessonDesc);
                            item.setVideoId(video.get("videoId"));
                            item.setTitle(lessonTitle);
                            item.setVideoUrl("https://www.youtube.com/watch?v=" + video.get("videoId"));
                            item.setThumbnailUrl(video.get("thumbnailUrl"));
                            item.setChannelName(video.get("channelTitle"));
                            item.setVideoDuration(video.get("duration"));
                            item.setXpReward(VIDEO_XP);

                            item.setPracticeTopic(lessonTitle);
                            item.setPracticeSubject(title);
                            item.setPracticeDifficulty(difficulty);

                            allItems.add(item);
                        }
                    }

                    // Add a Practice Checkpoint at the end of each day
                    StudyPlanItem practice = new StudyPlanItem();
                    practice.setItemType("PRACTICE");
                    practice.setDayNumber(dayNumber);
                    practice.setOrderIndex(itemOrder++);
                    practice.setTitle("Day " + dayNumber + " Checkpoint");
                    practice.setPracticeSubject(title);

                    // Use the last lesson title as the practice topic for the day
                    String lastLessonTitle = lessons.get(lessons.size() - 1).path("title").asText("Day Review");
                    practice.setPracticeTopic(lastLessonTitle);
                    practice.setPracticeDifficulty(difficulty);
                    practice.setXpReward(PRACTICE_XP);
                    practice.setDescription("Test your knowledge on today's topics.");

                    allItems.add(practice);
                }
            }

            // Step 3: Construct and Save Plan
            StudyPlan plan = new StudyPlan();
            plan.setTitle(title);
            plan.setDescription(description);
            plan.setTopic(title);
            plan.setDifficulty(difficulty);
            plan.setDurationDays(durationDays);
            plan.setStudent(student);
            plan.setCreatedAt(LocalDateTime.now());
            plan.setItems(allItems); // Set items directly

            // We need to associate items with the plan
            for (StudyPlanItem item : allItems) {
                item.setStudyPlan(plan);
            }

            StudyPlan savedPlan = studyPlanRepository.save(plan);

            // Generate quizzes for practice items asynchronously
            generateQuizQuestionsForPlan(savedPlan, title, difficulty);

            return savedPlan;
        });
    }

    private JsonNode parseJson(String jsonResponse) {
        try {
            String cleanJson = jsonResponse.replace("```json", "").replace("```", "").trim();
            return objectMapper.readTree(cleanJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage());
        }
    }

    public ActiveContextDto getActiveContext(String userEmail) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Get the most recent active (non-completed) plan
        List<StudyPlan> plans = studyPlanRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
        StudyPlan activePlan = plans.stream()
                .filter(p -> !p.isCompleted())
                .findFirst()
                .orElse(null);

        if (activePlan == null)
            return null;

        // Determine current day
        int totalDays = activePlan.getDurationDays();

        // Find the current day = the day of the first incomplete item
        int currentDay = activePlan.getItems().stream()
                .filter(item -> !item.isCompleted())
                .map(StudyPlanItem::getDayNumber)
                .min(Integer::compareTo)
                .orElse(totalDays);

        // Get today's items
        List<ActiveContextItemDto> todayItems = activePlan.getItems().stream()
                .filter(item -> item.getDayNumber() == currentDay)
                .map(item -> new ActiveContextItemDto(
                        item.getId(),
                        item.getTitle(),
                        item.getItemType(),
                        item.isCompleted(),
                        item.getPracticeTopic(),
                        item.getPracticeSubject(),
                        item.getPracticeDifficulty()))
                .toList();

        // Get next suggested practice
        SuggestedPracticeDto nextPractice = getSuggestedPracticeItem(userEmail);

        return new ActiveContextDto(
                activePlan.getId(),
                activePlan.getTitle(),
                activePlan.getProgress(),
                currentDay,
                totalDays,
                todayItems,
                nextPractice);
    }
}
