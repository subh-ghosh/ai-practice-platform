package com.practice.aiplatform.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Principal;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;

    public RateLimitFilter(RateLimitingService rateLimitingService) {
        this.rateLimitingService = rateLimitingService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Only rate limit API requests
        if (request.getRequestURI().startsWith("/api/")) {
            String key = getRateLimitKey(request);
            Bucket bucket = rateLimitingService.resolveBucket(key);
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

            if (!probe.isConsumed()) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests");
                return;
            }

            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
        }

        filterChain.doFilter(request, response);
    }

    private String getRateLimitKey(HttpServletRequest request) {
        Principal principal = request.getUserPrincipal();
        if (principal != null) {
            return principal.getName();
        }
        return request.getRemoteAddr();
    }
}
