Smart Self-Practice Platform Powered by AI

This project is a full-stack web application designed to help students practice specific subjects and difficulty levels. It uses generative AI to dynamically create unique questions and provides immediate, context-aware feedback on the submitted answers.

🚀 Core Features

Dynamic Question Generation: Questions are generated on-demand by the Google Gemini API based on user-selected subject and difficulty level.

Secure Authentication: User registration and login are handled by a robust Spring Boot backend using industry-standard BCrypt password hashing.

AI-Powered Evaluation: Submitted answers are sent back to the Gemini API, which provides a determination (Correct/Incorrect) and detailed feedback, replacing the need for local database checks.

Progress Tracking: Users can view a complete history of all questions asked, their submitted answers, and the AI-generated feedback.

Clean Architecture: Built on a modern, decoupled (API-first) architecture for scalability and maintenance.

💻 Technology Stack

Component

Technology

Rationale

Backend (API/Server)

Java (JDK 17)

High performance, widely used in enterprise applications.

Framework

Spring Boot 3

Simplifies setup and management of enterprise-grade Java services.

Database

PostgreSQL

Industry-standard, robust relational database.

AI Integration

Google Gemini API

Used for generating unique content and evaluating student answers.

Frontend (UI)

React

Leading JavaScript library for building fast, component-based user interfaces.

Styling/UI Kit

Material Tailwind

Provides professional, mobile-responsive components based on Google's Material Design.

API Client

Axios / WebClient (Java)

Used for reliable, promise-based HTTP requests between frontend, backend, and external APIs.

🛠️ Getting Started (Local Setup)

Prerequisites

You must have the following installed locally:

Java Development Kit (JDK 17)

PostgreSQL Database (running locally on port 5432)

Node.js & npm (for the frontend)

IntelliJ IDEA (recommended IDE)

Gemini API Key (set in ai-platform-backend/src/main/resources/application.properties)

Backend Setup (ai-platform-backend)

Configure Database: Ensure PostgreSQL is running and you have created an empty database named student_practice_db.

Edit application.properties: Update the database credentials and set your Gemini API Key.

spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD
gemini.api.key=YOUR_GEMINI_API_KEY


Run Application: Run the AiPlatformApplication.java file from IntelliJ. The server will start on http://localhost:8081.

Frontend Setup (ai-platform-frontend)

Install Dependencies: Navigate to the frontend directory in your terminal and run:

npm install


Run Development Server:

npm run dev


Access App: Open your browser and navigate to the local frontend server, typically http://localhost:5173/.

Now that the Canvas document is corrected, we can focus on your final project tasks.

We were deciding between: Refining the UI (upgrading Subject/Difficulty inputs) or Image Upload (the complex S3 feature). Which one is next?
