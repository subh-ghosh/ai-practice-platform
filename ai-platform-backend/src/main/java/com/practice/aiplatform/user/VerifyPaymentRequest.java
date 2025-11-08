package com.practice.aiplatform.user;

// Frontend sends this to our backend *after* a successful payment
public record VerifyPaymentRequest(
        String razorpay_order_id,
        String razorpay_payment_id,
        String razorpay_signature
) {}