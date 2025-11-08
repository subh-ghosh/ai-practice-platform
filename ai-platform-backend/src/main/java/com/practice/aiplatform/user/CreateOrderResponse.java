package com.practice.aiplatform.user;

// Backend sends this back to the frontend to open the Razorpay popup
public record CreateOrderResponse(
        String orderId,     // The Razorpay Order ID
        String keyId,       // Your Razorpay Key ID
        String productName,
        String amount,      // The amount in "paise" (e.g., "99900")
        String currency,
        String studentName,
        String studentEmail
) {}