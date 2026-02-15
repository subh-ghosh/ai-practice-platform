package com.practice.aiplatform.statistics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List; // <-- IMPORT

@RestController
@RequestMapping("/api/stats")
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final com.practice.aiplatform.user.StudentRepository studentRepository;
    private final com.practice.aiplatform.gamification.XpService xpService;

    public StatisticsController(StatisticsService statisticsService,
            com.practice.aiplatform.user.StudentRepository studentRepository,
            com.practice.aiplatform.gamification.XpService xpService) {
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
        com.practice.aiplatform.user.Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<com.practice.aiplatform.gamification.DailyXpHistory> history = xpService.getXpHistory(student.getId(), 30);

        List<DailyXpDto> response = history.stream()
                .map(h -> new DailyXpDto(h.getDate(), h.getXpEarned()))
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(response);
    }
}