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

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<StatisticsDto> getStatisticsSummary(Principal principal) {
        String email = principal.getName();
        StatisticsDto stats = statisticsService.getStatistics(email);
        return ResponseEntity.ok(stats);
    }

    // --- ADD THIS NEW ENDPOINT ---
    @GetMapping("/timeseries")
    public ResponseEntity<List<DailyStatDto>> getStatisticsTimeSeries(Principal principal) {
        String email = principal.getName();
        List<DailyStatDto> timeSeriesData = statisticsService.getTimeSeriesStats(email);
        return ResponseEntity.ok(timeSeriesData);
    }
}