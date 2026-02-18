# AI Practice Platform - Troubleshooting Guide

This guide addresses common issues encountered during development, setup, and deployment of the platform.

## 1. Setup & Environment Issues

### ❌ Problem: "GEMINI_API_KEY is missing"
- **Symptom:** Backend fails to start or practice generation returns 500 errors.
- **Solution:** Ensure you have a valid API key from [Google AI Studio](https://aistudio.google.com/).
    - **Docker:** Add `GEMINI_API_KEY` to your `.env` file or `docker-compose.yml`.
    - **Spring Boot:** Set the environment variable `GEMINI_API_KEY`.

### ❌ Problem: "Unable to determine Dialect"
- **Symptom:** Backend fails to connect to PostgreSQL.
- **Solution:** Verify your `SPRING_DATASOURCE_URL`.
    - If using Docker: `jdbc:postgresql://db:5432/aiplatform`
    - If local: `jdbc:postgresql://localhost:5432/aiplatform`
    - Ensure the database `aiplatform` exists.

## 2. Docker & Networking

### ❌ Problem: "Frontend cannot talk to Backend (404/ECONNREFUSED)"
- **Symptom:** Authentication or practice requests fail in the browser.
- **Solution:** 
    1. Check `VITE_API_BASE_URL` in the frontend `.env`.
    2. In Docker Compose, the frontend talks to the backend via the browser, so use the **publicly accessible IP/DNS** (e.g., `http://localhost:8080/api`) not the container name.
    3. Verify CORS settings in `SecurityConfig.java`.

## 3. AI & YouTube APIs

### ❌ Problem: "AI returns empty/invalid JSON"
- **Symptom:** Questions show "Missing Content" or the UI hangs on loading.
- **Solution:** 
    - Check the terminal logs for "JSON Parsing Error."
    - This usually happens if the subject is extremely niche or triggers safety filters. Try a standard subject like "Java" or "History."

### ❌ Problem: "YouTube search results are irrelevant"
- **Symptom:** Study Plan videos don't match the topic.
- **Solution:** The platform uses keyword extraction. If the syllabus is too vague (e.g., "Intro to X"), the AI might struggle. Provide more context in the study plan title.

## 4. Payment Integration

### ❌ Problem: "Razorpay Signature Verification Failed"
- **Symptom:** Payments are successful but status doesn't update on the UI.
- **Solution:** Verify your `RAZORPAY_KEY_SECRET`. Ensure the webhook URL in Razorpay Dashboard exactly matches your backend's `/api/payments/webhook` endpoint.

---
> [!TIP]
> Always check the `build_log.txt` and `chat_test_trace.log` files in the root for a detailed history of system events during debugging.
