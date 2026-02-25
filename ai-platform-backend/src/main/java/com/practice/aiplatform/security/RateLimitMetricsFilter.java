package com.practice.aiplatform.security;

import com.practice.aiplatform.config.RateLimitMetricsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitMetricsFilter extends OncePerRequestFilter {

    private final RateLimitMetricsService rateLimitMetricsService;

    public RateLimitMetricsFilter(RateLimitMetricsService rateLimitMetricsService) {
        this.rateLimitMetricsService = rateLimitMetricsService;
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
        filterChain.doFilter(request, response);

        if (response.getStatus() == 429) {
            rateLimitMetricsService.recordBlocked(endpoint, keyType);
        } else {
            rateLimitMetricsService.recordAllowed(endpoint, keyType);
        }
    }

    private String resolveEndpoint(String uri) {
        if (uri == null) {
            return null;
        }
        if (uri.startsWith("/api/ai/")) {
            return "ai_all";
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
