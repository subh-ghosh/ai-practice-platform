package com.practice.aiplatform.user;

// Frontend will send the product ID (e.g., "premium_monthly")
public record CreateOrderRequest(String productId) {}