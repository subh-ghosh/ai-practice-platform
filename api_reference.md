# AI Practice Platform - API Reference

This document provides a comprehensive guide to the backend API endpoints, including request and response formats.

## Base URL
`http://localhost:8080/api` (Local)
`https://ai-practice-platform-ep13.onrender.com/api` (Production)

## Authentication
All protected endpoints require a `Bearer <JWT_TOKEN>` in the `Authorization` header.

### 1. Register Student
`POST /students/register`
- **Request:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response:** `200 OK` with Student object.

### 2. Login
`POST /students/login`
- **Request:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response:**
  ```json
  {
    "jwt": "eyJhbG...",
    "refreshToken": "abcdef..."
  }
  ```

---

## AI & Practice

### 3. Generate Question
`POST /practice/generate`
- **Request:**
  ```json
  {
    "subject": "Java",
    "topic": "Inheritance",
    "difficulty": "High School"
  }
  ```
- **Response:** Returns a `Question` object containing AI-generated text and options.

### 4. Submit Answer
`POST /practice/submit`
- **Request:**
  ```json
  {
    "questionId": 123,
    "selectedOption": "B",
    "timeTakenSeconds": 45
  }
  ```
- **Response:** Returns `Answer` object with `evaluationStatus` (CORRECT/INCORRECT) and AI feedback.

---

## Study Plans

### 5. Generate Study Plan
`POST /study-plans/generate`
- **Request:**
  ```json
  {
    "title": "Learn Spring Boot",
    "durationDays": 7,
    "difficulty": "Intermediate"
  }
  ```
- **Response:** Returns a structured `StudyPlan` with daily items.

### 6. Upload Syllabus
`POST /study-plans/upload-syllabus`
- **Request:** `Multipart/Form-Data` with `file` and `durationDays`.

---

## Gamification & Stats

### 7. Get Recommendations
`GET /recommendations`
- **Response:** List of `EnhancedRecommendation` objects (WEAKNESS, MASTERED, etc.).

### 8. Get Statistics
`GET /stats/overview`
- **Response:** Aggregated accuracy, XP, and daily activity charts.

### 9. Get Badges
`GET /gamification/badges`
- **Response:** List of unlocked badges for the current user.

---

## Error Handling
Errors are returned in a standard format:
```json
{
  "timestamp": "2024-03-21T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Detailed error message here",
  "path": "/api/..."
}
```
