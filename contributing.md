# Contributing to AI Practice Platform

First off, thank you for considering contributing to the AI Practice Platform! This project is designed to be a collaborative hub for AI-driven education.

## 🛠️ Tech Stack Requirements
- **Java 17+** (OpenJDK Recommended)
- **Node.js 18+** & **NPM**
- **Docker & Docker Compose**
- **PostgreSQL 15**

## 📜 Development Standards

### Backend (Java/Spring)
- **Code Style:** Follow standard Google Java Style. Use IntelliJ IDEA's default formatting.
- **Layered Architecture:**
    - `Controller`: Handle HTTP req/res only.
    - `Service`: Focus on business/AI logic.
    - `Repository`: Pure database interaction.
- **Error Handling:** Use custom exceptions and handle them in `GlobalExceptionHandler`.

### Frontend (React/Vite)
- **Component Pattern:** Use functional components with hooks.
- **Styling:** Use Tailwind CSS utility classes. Avoid inline styles.
- **State:** Use Context API for global state and `useState` for local component state.
- **Formatting:** Prettier will automatically format your code on save (if configured).

## 🚀 Branching Strategy
- `main`: Production-ready, stable code.
- `develop`: Ongoing feature integration.
- `feature/<name>`: New features or improvements.
- `bugfix/<name>`: Fixes for identified issues.

## 📝 Pull Request Process
1. **Sync:** Pull the latest changes from `develop`.
2. **Commit:** Write descriptive, imperative commit messages (e.g., `Add XP multiplier for hard questions`).
3. **Test:** Run `./mvnw test` (backend) and ensure the frontend build passes.
4. **Detail:** Describe your changes in the PR description, including any new environment variables required.

## ⚖️ Security Notice
- **NEVER** commit API keys or secrets.
- Use the provided `.env.example` templates for local configuration.
- All AI logic should be gated by the `RateLimitFilter`.

---
> [!IMPORTANT]
> By contributing, you agree that your code will be licensed under the project's existing license.
