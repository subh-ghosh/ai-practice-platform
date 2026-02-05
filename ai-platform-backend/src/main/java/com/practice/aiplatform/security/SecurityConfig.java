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

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Enable CORS (Allow Frontend to talk to Backend)
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("https://ai-practice-platform.vercel.app", "http://localhost:5173"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                return config;
            }))
            // 2. Disable CSRF (Not needed for JWT)
            .csrf(csrf -> csrf.disable())
            // 3. Define Access Rules
            .authorizeHttpRequests(auth -> auth
                // Public Endpoints (No Login Required)
                .requestMatchers("/api/students/login", "/api/students/register", "/api/students/oauth/**", "/api/payments/webhook").permitAll()
                
                // Protected Endpoints (Login Required)
                // We allow ANY authenticated user (Student or Admin) to access these:
                .requestMatchers("/api/ai/**").authenticated()           // 👈 Fixes Question Generation
                .requestMatchers("/api/practice/**").authenticated()     // 👈 Fixes Answer Submission
                .requestMatchers("/api/stats/**").authenticated()        // 👈 Fixes Dashboard Stats
                .requestMatchers("/api/notifications/**").authenticated()// 👈 Fixes Notifications
                .requestMatchers("/api/payments/**").authenticated()     // 👈 Fixes Payments
                .requestMatchers("/api/students/profile", "/api/students/password", "/api/students/account").authenticated()
                
                // All other requests require login
                .anyRequest().authenticated()
            )
            // 4. No Sessions (State management is handled by Token)
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 5. Add our JWT Filter before the standard login filter
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

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