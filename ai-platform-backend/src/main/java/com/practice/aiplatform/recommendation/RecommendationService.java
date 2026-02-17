package com.practice.aiplatform.recommendation;

import com.practice.aiplatform.practice.Answer;
import com.practice.aiplatform.practice.AnswerRepository;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final AnswerRepository answerRepository;
    private final StudentRepository studentRepository;

    public RecommendationService(AnswerRepository answerRepository, StudentRepository studentRepository) {
        this.answerRepository = answerRepository;
        this.studentRepository = studentRepository;
    }

    public record Recommendation(String type, String topic, String difficulty, String reason, String action) {
    }

    public record Prediction(String topic, String difficulty, double winProbability, String confidence) {
    }

    public List<Recommendation> getRecommendations(String userEmail) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> history = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);
        if (history.isEmpty()) {
            return List.of(new Recommendation("START", "Java", "Beginner", "No history found",
                    "Start with a Beginner Java Quiz"));
        }

        Map<String, List<Answer>> topicStats = history.stream()
                .collect(Collectors.groupingBy(a -> a.getQuestion().getTopic()));

        List<Recommendation> recommendations = new ArrayList<>();

        for (Map.Entry<String, List<Answer>> entry : topicStats.entrySet()) {
            String topic = entry.getKey();
            List<Answer> answers = entry.getValue();

            // Calculate accuracy
            long correct = answers.stream().filter(Answer::getIsCorrect).count();
            double accuracy = (double) correct / answers.size();

            // Weakness Detection (< 60%)
            if (accuracy < 0.6 && answers.size() >= 3) {
                recommendations.add(new Recommendation(
                        "WEAKNESS",
                        topic,
                        "Beginner",
                        String.format("Accuracy: %.0f%% (Struggling)", accuracy * 100),
                        "Review Basic Concepts & Take a Recovery Quiz"));
            }
            // Strength Detection (> 85%)
            else if (accuracy > 0.85 && answers.size() >= 5) {
                recommendations.add(new Recommendation(
                        "STRENGTH",
                        topic,
                        "Hard",
                        String.format("Accuracy: %.0f%% (Mastered)", accuracy * 100),
                        "Challenge yourself with Hard questions"));
            }
        }

        // Sort: Weakness first (prioritize fixing gaps)
        recommendations.sort(Comparator.comparing(r -> r.type().equals("WEAKNESS") ? 0 : 1));

        return recommendations.isEmpty()
                ? List.of(new Recommendation("EXPLORE", "New Topic", "Medium", "Keep exploring!", "Try a new topic"))
                : recommendations;
    }

    public Prediction predictSuccess(String userEmail, String topic, String difficulty) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> history = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);

        // Filter by topic
        List<Answer> topicHistory = history.stream()
                .filter(a -> a.getQuestion().getTopic().equalsIgnoreCase(topic))
                .limit(20) // Look at last 20 answers for relevance
                .toList();

        if (topicHistory.isEmpty()) {
            return new Prediction(topic, difficulty, 0.5, "LOW_DATA"); // Neutral prediction if no data
        }

        // Weighted Average (Recency Bias) - simple heuristic
        double totalWeight = 0;
        double weightedScore = 0;

        for (int i = 0; i < topicHistory.size(); i++) {
            Answer a = topicHistory.get(i);
            // Recent answers have higher weight.
            // e.g., 20 items: i=0 (newest) weight=20, i=19 (oldest) weight=1
            double weight = topicHistory.size() - i;

            double score = a.getIsCorrect() ? 1.0 : 0.0;
            // Adjust score based on difficulty match if possible (simplified here)

            weightedScore += score * weight;
            totalWeight += weight;
        }

        double probability = totalWeight > 0 ? weightedScore / totalWeight : 0.5;

        // Adjust for diffculty increase
        if ("Hard".equalsIgnoreCase(difficulty)) {
            probability *= 0.8; // Harder to win
        }

        String confidence = topicHistory.size() > 10 ? "HIGH" : "MEDIUM";

        return new Prediction(topic, difficulty, probability, confidence);
    }
}
