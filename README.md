# Smart Self-Practice Platform Powered by AI
🎯 **Live Demo:** [ai-practice-platform.vercel.app](https://ai-practice-platform.vercel.app)

This project is a full-stack web application designed to help students practice specific subjects and difficulty levels. It uses **generative AI** to dynamically create unique questions and provides immediate, context-aware feedback on the submitted answers.

---

## 📚 Technical Documentation Manual (Platinum Tier)

We have created an exhaustive suite of technical documentation for developers, architects, and product owners. 

| Document | Description |
| :--- | :--- |
| **[Project Overview](./overview.md)** | High-level mission, tech stack, and visual architecture diagrams. |
| **[Backend Deep Dive](./backend.md)** | AI orchestration, security logic, and gamification behavioral engineering. |
| **[Frontend Deep Dive](./frontend.md)** | UI design system, state management, and intelligent dashboard logic. |
| **[Infrastructure & Setup](./infrastructure.md)** | Docker multi-stage builds and operational decisions. |
| **[Full API Reference](./api_reference.md)** | Complete contract guide for all backend endpoints. |
| **[Database Schema](./database_schema.md)** | Detailed Entity relationship breakdown and table definitions. |
| **[Troubleshooting Guide](./troubleshooting.md)** | Common setup pitfalls and Docker/API fixes. |
| **[Contributing Guide](./contributing.md)** | Coding standards, PR processes, and security rules. |
| **[Product Roadmap](./roadmap.md)** | The long-term vision and upcoming AI features. |

---

## ⚡ Performance & Resilience Engineering

**Engineered fault-tolerance for upstream AI APIs using Resilience4J (Circuit Breakers & Bulkheads). Eliminated 20% HTTP failure rates under stress and dropped extreme-load P95 latency by 98% (6.5s to 128ms) via Fast-Fail semantics.**

The system is fully resilient against external AI provider degradation, ensuring the core platform remains functional under extreme concurrency using strictly tuned thread isolation and bulkheading.

> *For full load-testing and performance metric data, review the [Unified Resilience Results](./Performance/UNIFIED_RESILIENCE_RESULTS.md).*

---

## 🚀 Core Features
* **Dynamic Question Generation:** Questions are generated on-demand by the **Google Gemini API**.
* **AI-Powered Evaluation:** Context-aware feedback on every answer.
* **Intelligent Study Plans:** Automatic day-by-day learning paths with YouTube integration.
* **Gamification:** XP, Badges, and Daily Challenges to drive motivation.
* **Responsive Dashboard:** Sleek "Cosmic Glass" UI with real-time statistics.

## 💻 Tech Stack
- **Backend:** Spring Boot 3, Java 17, PostgreSQL, JPA/Hibernate.
- **Frontend:** React 18, Vite, Material Tailwind, Framer Motion.
- **AI:** Google Gemini Pro (Text reasoning & JSON orchestration).
- **Infra:** Docker (Multi-stage), GitHub Actions, Vercel/Render.

---

## 🛠️ Getting Started (Quick Setup)
1. **Clone the repo.**
2. **Backend:** Set `GEMINI_API_KEY` and `SPRING_DATASOURCE_URL`. Run `./mvnw spring-boot:run`.
3. **Frontend:** `npm install` and `npm run dev`.
4. **Docker:** `docker-compose up --build`.

For detailed setup instructions and developer standards, see the **[Contributing Guide](./contributing.md)** and **[Troubleshooting](./troubleshooting.md)**.
