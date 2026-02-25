package com.practice.aiplatform.security;

import com.practice.aiplatform.config.RateLimitMetricsService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class RateLimitMetricsFilter extends OncePerRequestFilter {

    private final RateLimitMetricsService rateLimitMetricsService;
    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final int aiUserCapacity;
    private final int aiUserRefillMinutes;
    private final int aiIpCapacity;
    private final int aiIpRefillMinutes;
    private final int studyPlanUserCapacity;
    private final int studyPlanUserRefillMinutes;
    private final int studyPlanIpCapacity;
    private final int studyPlanIpRefillMinutes;

    public RateLimitMetricsFilter(
            RateLimitMetricsService rateLimitMetricsService,
            @Value("${rate.limit.ai.user.capacity:60}") int aiUserCapacity,
            @Value("${rate.limit.ai.user.refill-minutes:1}") int aiUserRefillMinutes,
            @Value("${rate.limit.ai.ip.capacity:20}") int aiIpCapacity,
            @Value("${rate.limit.ai.ip.refill-minutes:1}") int aiIpRefillMinutes,
            @Value("${rate.limit.study-plan.user.capacity:10}") int studyPlanUserCapacity,
            @Value("${rate.limit.study-plan.user.refill-minutes:60}") int studyPlanUserRefillMinutes,
            @Value("${rate.limit.study-plan.ip.capacity:3}") int studyPlanIpCapacity,
            @Value("${rate.limit.study-plan.ip.refill-minutes:60}") int studyPlanIpRefillMinutes) {
        this.rateLimitMetricsService = rateLimitMetricsService;
        this.aiUserCapacity = aiUserCapacity;
        this.aiUserRefillMinutes = aiUserRefillMinutes;
        this.aiIpCapacity = aiIpCapacity;
        this.aiIpRefillMinutes = aiIpRefillMinutes;
        this.studyPlanUserCapacity = studyPlanUserCapacity;
        this.studyPlanUserRefillMinutes = studyPlanUserRefillMinutes;
        this.studyPlanIpCapacity = studyPlanIpCapacity;
        this.studyPlanIpRefillMinutes = studyPlanIpRefillMinutes;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String endpoint = resolveEndpoint(request.getRequestURI());
        if (endpoint == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String keyType = resolveKeyType();
        String principalKey = resolvePrincipalKey(request, keyType);
        String bucketKey = endpoint + "|" + keyType + "|" + principalKey;
        Bucket bucket = buckets.computeIfAbsent(bucketKey, ignored -> buildBucket(endpoint, keyType));
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (!probe.isConsumed()) {
            rateLimitMetricsService.recordBlocked(endpoint, keyType);
            long retryAfter = (long) Math.ceil(probe.getNanosToWaitForRefill() / 1_000_000_000.0);
            response.setStatus(429);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Retry-After", String.valueOf(Math.max(retryAfter, 1)));
            response.getWriter().write("{\"error\":\"Rate limit exceeded\",\"endpoint\":\"" + endpoint + "\"}");
            return;
        }

        rateLimitMetricsService.recordAllowed(endpoint, keyType);
        filterChain.doFilter(request, response);

        if (response.getStatus() == 429) {
            rateLimitMetricsService.recordBlocked(endpoint, keyType);
        }
    }

    private Bucket buildBucket(String endpoint, String keyType) {
        boolean aiEndpoint = endpoint.startsWith("ai_");
        int capacity;
        int refillMinutes;

        if (aiEndpoint) {
            if ("user".equals(keyType)) {
                capacity = aiUserCapacity;
                refillMinutes = aiUserRefillMinutes;
            } else {
                capacity = aiIpCapacity;
                refillMinutes = aiIpRefillMinutes;
            }
        } else {
            if ("user".equals(keyType)) {
                capacity = studyPlanUserCapacity;
                refillMinutes = studyPlanUserRefillMinutes;
            } else {
                capacity = studyPlanIpCapacity;
                refillMinutes = studyPlanIpRefillMinutes;
            }
        }

        Bandwidth limit = Bandwidth.classic(
                Math.max(capacity, 1),
                Refill.greedy(Math.max(capacity, 1), Duration.ofMinutes(Math.max(refillMinutes, 1)))
        );
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolvePrincipalKey(HttpServletRequest request, String keyType) {
        if ("user".equals(keyType)) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().isBlank()) {
                return auth.getName();
            }
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        String remoteAddr = request.getRemoteAddr();
        return remoteAddr == null ? "unknown" : remoteAddr;
    }

    private String resolveEndpoint(String uri) {
        if (uri == null) {
            return null;
        }
        if ("/api/ai/generate-question".equals(uri)) {
            return "ai_generate_question";
        }
        if ("/api/ai/get-hint".equals(uri)) {
            return "ai_get_hint";
        }
        if ("/api/ai/get-answer".equals(uri)) {
            return "ai_get_answer";
        }
        if ("/api/study-plans/generate".equals(uri)) {
            return "study_plan_generate";
        }
        if ("/api/study-plans/generate-from-syllabus".equals(uri)) {
            return "study_plan_generate_from_syllabus";
        }
        return null;
    }

    private String resolveKeyType() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "ip";
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof String value && "anonymousUser".equalsIgnoreCase(value)) {
            return "ip";
        }
        return "user";
    }
}
