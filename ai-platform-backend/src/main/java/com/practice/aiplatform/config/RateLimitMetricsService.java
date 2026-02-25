package com.practice.aiplatform.config;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

@Service
public class RateLimitMetricsService {

    private final MeterRegistry meterRegistry;

    public RateLimitMetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void recordAllowed(String endpoint, String keyType) {
        meterRegistry.counter(
                "rate_limit_allowed_total",
                "endpoint", endpoint,
                "key_type", keyType
        ).increment();
    }

    public void recordBlocked(String endpoint, String keyType) {
        meterRegistry.counter(
                "rate_limit_blocked_total",
                "endpoint", endpoint,
                "key_type", keyType
        ).increment();
    }
}
