package com.practice.aiplatform.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

// DTOs to map chat completion responses from the AI provider.

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiResponse(List<AiChoice> choices) { }

@JsonIgnoreProperties(ignoreUnknown = true)
record AiChoice(AiMessage message) { }

@JsonIgnoreProperties(ignoreUnknown = true)
record AiMessage(String content) { }
