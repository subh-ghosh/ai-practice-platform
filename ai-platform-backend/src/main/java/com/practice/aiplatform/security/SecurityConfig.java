package com.practice.aiplatform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Creates a Bean for the BCrypt Password Encoder
    // This is the industry-standard hashing algorithm
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // This method configures our web security rules
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF (Cross-Site Request Forgery) - common for JSON APIs
                .csrf(AbstractHttpConfigurer::disable)

                // Start authorizing HTTP requests
                .authorizeHttpRequests(auth -> auth
                        // 1. Allow anyone (permitAll) to access these specific URLs
                        .requestMatchers("/api/students/register").permitAll()
                        .requestMatchers("/api/students/login").permitAll()
                        .requestMatchers("/api/ai/generate-question").permitAll()

                        // --- NEW RULE ---
                        // Allow access to all practice endpoints (history, submit, etc.)
                        .requestMatchers("/api/practice/**").permitAll()

                        // 2. Any other request (anyRequest) must be authenticated
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}

