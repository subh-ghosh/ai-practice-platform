package com.practice.aiplatform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    /**
     * Creates a pre-configured WebClient bean specifically for the Gemini API.
     * This bean can be @Autowired in other services (like GeminiService).
     *
     * @return A configured WebClient instance.
     */
    @Bean("geminiWebClient")
    public WebClient geminiWebClient() {
        return WebClient.builder()
                // Set the base URL for the Gemini API
                .baseUrl("https://generativelanguage.googleapis.com")
                // Set a default header, as the Gemini API always expects JSON content
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Creates a pre-configured WebClient bean for the YouTube Data API v3.
     */
    @Bean("youtubeWebClient")
    public WebClient youtubeWebClient() {
        return WebClient.builder()
                .baseUrl("https://www.googleapis.com/youtube/v3")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
