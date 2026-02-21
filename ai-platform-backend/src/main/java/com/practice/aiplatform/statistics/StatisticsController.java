package com.practice.aiplatform.statistics;

import com.practice.aiplatform.gamification.DailyXpHistory;
import com.practice.aiplatform.gamification.XpService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/stats")
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final StudentRepository studentRepository;
    private final XpService xpService;

    public StatisticsController(
            StatisticsService statisticsService,
            StudentRepository studentRepository,
            XpService xpService) {
        this.statisticsService = statisticsService;
        this.studentRepository = studentRepository;
        this.xpService = xpService;
    }

    @GetMapping("/summary")
    public ResponseEntity<StatisticsDto> getStatisticsSummary(Principal principal) {
        String email = principal.getName();
        StatisticsDto stats = statisticsService.getStatistics(email);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/timeseries")
    public ResponseEntity<List<DailyStatDto>> getStatisticsTimeSeries(Principal principal) {
        String email = principal.getName();
        List<DailyStatDto> timeSeriesData = statisticsService.getTimeSeriesStats(email);
        return ResponseEntity.ok(timeSeriesData);
    }

    @GetMapping("/xp-history")
    public ResponseEntity<List<DailyXpDto>> getXpHistory(Principal principal) {
        String email = principal.getName();

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<DailyXpHistory> history = xpService.getXpHistory(student.getId(), 30);

        List<DailyXpDto> response = new ArrayList<>();
        for (DailyXpHistory item : history) {
            response.add(new DailyXpDto(item.getDate(), item.getXpEarned()));
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<StatisticsService.SmartRecommendationDto> getRecommendations(Principal principal) {
        StatisticsService.SmartRecommendationDto recommendations =
                statisticsService.getSmartRecommendations(principal.getName());

        return ResponseEntity.ok(recommendations);
    }
}