package com.practice.aiplatform.studyplan;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.practice.aiplatform.ai.GeminiService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StudyPlanService {

    private final GeminiService geminiService;
    private final YouTubeService youTubeService;
    private final StudyPlanRepository studyPlanRepository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;

    public StudyPlanService(GeminiService geminiService,
            YouTubeService youTubeService,
            StudyPlanRepository studyPlanRepository,
            StudentRepository studentRepository,
            ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.youTubeService = youTubeService;
        this.studyPlanRepository = studyPlanRepository;
        this.studentRepository = studentRepository;
        this.objectMapper = objectMapper;
    }

    public Mono<StudyPlan> generateStudyPlan(String userEmail, String topic, String difficulty, int durationDays) {
        return Mono.fromCallable(() -> {
            Student student = studentRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Step 1: Search YouTube for relevant videos
            int maxVideos = Math.min(durationDays * 3, 25); // ~3 videos/day, max 25
            List<Map<String, String>> videos = youTubeService.searchVideos(
                    topic + " " + difficulty + " tutorial", maxVideos);

            if (videos.isEmpty()) {
                throw new RuntimeException("No YouTube videos found for the topic: " + topic);
            }

            // Step 2: Build AI prompt with video data
            String prompt = createPrompt(topic, difficulty, durationDays, videos);

            // Step 3: Call Gemini to curate and organize
            String aiResponse = geminiService.generateRawContent(prompt).block();

            // Step 4: Parse and save
            return parseAndSavePlan(aiResponse, student, topic, difficulty, durationDays, videos);
        });
    }

    private String createPrompt(String topic, String difficulty, int durationDays, List<Map<String, String>> videos) {
        // Build video list for the prompt
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

                        Here are YouTube videos available for this topic:
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

            // Build a lookup map: videoId -> video metadata
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
                                    // AI returned a videoId we don't have — skip
                                    System.err.println("Warning: Unknown videoId from AI: " + videoId);
                                    continue;
                                }
                            } else if ("PRACTICE".equals(type)) {
                                item.setTitle("Practice: " + itemNode.path("practiceTopic").asText(topic));
                                item.setPracticeSubject(itemNode.path("practiceSubject").asText(topic));
                                item.setPracticeTopic(itemNode.path("practiceTopic").asText(topic));
                                item.setPracticeDifficulty(itemNode.path("practiceDifficulty").asText(difficulty));
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
            throw new RuntimeException("Failed to parse AI study plan response: " + e.getMessage());
        }
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

    public StudyPlanItem markItemComplete(Long planId, Long itemId) {
        StudyPlan plan = studyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Study plan not found"));

        StudyPlanItem item = plan.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in this plan"));

        item.setCompleted(true);

        // Recalculate progress
        long totalItems = plan.getItems().size();
        long completedItems = plan.getItems().stream().filter(StudyPlanItem::isCompleted).count();
        int progress = (int) ((completedItems * 100) / totalItems);
        plan.setProgress(progress);
        plan.setCompleted(progress == 100);

        studyPlanRepository.save(plan);
        return item;
    }
}
