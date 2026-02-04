package com.practice.aiplatform.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Read the URL from application.properties (which gets it from Render Env Vars)
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Enable CORS (Crucial Fix)
            .cors(Customizer.withDefaults())
            
            // 2. Disable CSRF (Standard for JWT APIs)
            .csrf(csrf -> csrf.disable())
            
            // 3. Define Public vs Private Routes
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/students/login", "/api/students/register", "/api/students/oauth/**", "/error").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // Explicitly allow pre-flight checks
                .anyRequest().authenticated()
            )
            
            // 4. Add your JWT Filter (assuming you have this class)
            // .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class) 
            // ^ UNCOMMENT the line above if you have your JwtAuthenticationFilter ready!
            ;

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow your specific Frontend URL
        configuration.setAllowedOrigins(List.of(frontendUrl, "http://localhost:5173")); 
        
        // Allow all standard methods
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Allow all headers (Authorization, Content-Type, etc.)
        configuration.setAllowedHeaders(List.of("*"));
        
        // Allow credentials (Cookies/Auth Headers)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}