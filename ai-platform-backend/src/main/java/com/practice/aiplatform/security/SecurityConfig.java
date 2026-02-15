package com.practice.aiplatform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;
    private final RateLimitFilter rateLimitFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter, RateLimitFilter rateLimitFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Enable CORS (Allow Frontend to talk to Backend)
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    // Use patterns to allow all origins (including Vercel previews)
                    config.setAllowedOriginPatterns(List.of("*"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                // 2. Disable CSRF (Not needed for JWT)
                .csrf(csrf -> csrf.disable())
                // 3. Define Access Rules
                .authorizeHttpRequests(auth -> auth
                        // Public Endpoints
                        .requestMatchers("/health", "/actuator/health").permitAll()
                        .requestMatchers("/api/courses/ping").permitAll() // DEBUG ENDPOINT
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // ALLOW
                                                                                                         // PREFLIGHT
                        .requestMatchers("/api/students/login", "/api/students/register", "/api/students/oauth/**",
                                "/api/payments/webhook", "/api/students/verify-email/**", "/api/students/refresh-token")
                        .permitAll()
                        .requestMatchers("/api/students/oauth/google").permitAll()

                        // Protected Endpoints
                        .requestMatchers("/api/ai/**").authenticated()
                        .requestMatchers("/api/practice/**").authenticated()
                        .requestMatchers("/api/stats/**").authenticated()
                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/api/payments/**").authenticated()
                        .requestMatchers("/api/students/profile", "/api/students/password", "/api/students/account")
                        .authenticated()
                        .requestMatchers("/api/courses/**").authenticated()
                        .requestMatchers("/api/study-plans/**").authenticated()

                        // All other requests require login
                        .anyRequest().authenticated())
                // 4. No Sessions
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 5. Add JWT Filter
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
                // 6. Add Rate Limit Filter (After JWT so we have Principal)
                .addFilterAfter(rateLimitFilter, JwtRequestFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}