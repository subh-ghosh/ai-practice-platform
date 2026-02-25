package com.practice.aiplatform.config;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Configuration;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;

@Configuration
public class JvmMetricsConfig {

    public JvmMetricsConfig(MeterRegistry meterRegistry) {
        MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();

        Gauge.builder("custom_jvm_heap_used_bytes", memoryMXBean, bean -> bean.getHeapMemoryUsage().getUsed())
                .description("Current JVM heap memory used in bytes")
                .register(meterRegistry);

        Gauge.builder("custom_jvm_nonheap_used_bytes", memoryMXBean, bean -> bean.getNonHeapMemoryUsage().getUsed())
                .description("Current JVM non-heap memory used in bytes")
                .register(meterRegistry);
    }
}
