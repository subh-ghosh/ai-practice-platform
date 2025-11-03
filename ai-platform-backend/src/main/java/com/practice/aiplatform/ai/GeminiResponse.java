package com.practice.aiplatform.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

// These records are DTOs to map the JSON response from the Gemini API.
// We use @JsonIgnoreProperties to avoid errors if the API sends fields we don't care about.

@JsonIgnoreProperties(ignoreUnknown = true)
public record GeminiResponse(List<GeminiCandidate> candidates) { }

@JsonIgnoreProperties(ignoreUnknown = true)
record GeminiCandidate(GeminiContent content) { }

@JsonIgnoreProperties(ignoreUnknown = true)
record GeminiContent(List<GeminiPart> parts) { }

@JsonIgnoreProperties(ignoreUnknown = true)
record GeminiPart(String text) { }
