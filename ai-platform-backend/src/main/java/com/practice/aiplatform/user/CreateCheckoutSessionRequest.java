package com.practice.aiplatform.user;

// This will hold the "Price ID" from your Stripe dashboard
public record CreateCheckoutSessionRequest(String priceId) {}