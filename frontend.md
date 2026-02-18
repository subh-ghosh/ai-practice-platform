# AI Practice Platform - Frontend Documentation

## Detailed Technology Stack

### Core Framework & Build Tool
- **React 18.2.0**: The UI library for building a component-based, interactive user interface.
- **Vite 4.5.0**: A fast build tool and development server that provides lightning-fast HMR (Hot Module Replacement).

### UI & Styling
- **Tailwind CSS 3.3.4**: Utility-first CSS framework for rapid and consistent styling.
- **Material Tailwind 2.1.10**: A set of professional React components based on Material Design, customized for the "Cosmic Glass" aesthetic.
- **Framer Motion 12.34.0**: Powerful animation library used for smooth page transitions and interactive micro-animations.
- **Heroicons 2.0.18**: Beautifully crafted SVG icons for common UI actions.
- **Clsx & Tailwind-Merge**: Utilities for dynamically and cleanly managing Tailwind CSS classes.

### Support for Content & Data
- **React Markdown 10.1.0 & Remark GFM**: Used to render AI-generated responses (which may include markdown formatting, tables, or lists) into clean HTML.
- **ApexCharts 3.44.0 & React-ApexCharts**: High-performance charting library for visualizing user progress and statistics.

### State Management & Navigation
- **React Router DOM 6.17.0**: Manages client-side routing and protected routes (e.g., Dashboard vs. Login).
- **React Context API**: Used for lightweight, global state management (Auth, Theme, Notifications).

### Communication & Auth
- **Axios 1.13.1**: Promise-based HTTP client for making API requests to the Spring Boot backend.
- **Google OAuth (@react-oauth/google) 0.12.2**: Simplifies the integration of "Sign in with Google" for a seamless user onboarding experience.
- **React Hot Toast 2.6.0**: Lightweight notification library for real-time feedback (success/error messages).

### Development & Quality
- **Prettier & Prettier-Plugin-TailwindCSS**: Ensures consistent code formatting and automatically sorts Tailwind classes for readability.
- **PostCSS & Autoprefixer**: Handles CSS transformations and ensures cross-browser compatibility.

## Design Engineering: The "Why" and "How"

### 1. UI Foundation: Why Material Tailwind?
**Problem:** Building a premium, accessible UI from scratch is time-consuming and prone to design inconsistencies.
**Solution:** 
- **The Choice:** We chose **Material Tailwind** because it combines the power of **Tailwind CSS** (for layout flexibility) with high-quality **Material Design** components (for accessible forms and navigation).
- **Customization:** We didn't settle for defaults; we extended the Tailwind config to implement the "Cosmic Glass" aesthetic (backdrop blurs, specific gradients), ensuring the app feels unique rather than "generic material."

### 2. State Management: Solving Prop-Drilling
**Problem:** Passing authentication tokens and theme settings through 5+ layers of components (prop-drilling) makes the code brittle and hard to maintain.
**Solution:**
- **Context API:** We used the **React Context API** for global state. This allows any component (like the `AICoachCard`) to access user data or toggle light/dark mode without intermediary props.
- **Why not Redux?** For this scale, Redux adds unnecessary boilerplate. Context API is native to React and provides a cleaner, more performant solution for these specific requirements.

### 3. Real-time Feedback: The "Apps-like" Experience
**Problem:** Traditional web apps often feel "laggy" during long AI or network calls, leading users to believe the site is frozen.
**Solution:**
- **Axios Interceptors:** We centralized all API logic. If a request is made, the interceptor handles the logic, and **React Hot Toast** provides immediate visual confirmation (e.g., "AI is thinking...").
- **Skeleton States & Spinners:** We implemented custom loading widgets that maintain the "Cosmic Glass" blur effect even while content is being fetched.
- **Rationale:** By ensuring every user action has an immediate visual reaction, we achieve a "premium app" feel that increases user engagement.

### 4. Intelligent Dashboards: Content Prioritization
**Problem:** A platform with hundreds of topics can be overwhelming. Users waste time "window shopping" for content instead of learning.
**Solution:**
- **TodaysFocus Component:** We developed a centralized "Daily Mission Control." It fetches the active `StudyPlan` context and presents the user with a singular "Next Step" (e.g., a specific practice topic or video).
- **Context-Aware Deep Linking:** The `RecommendationCard` doesn't just show data; it generates a direct URL that pre-fills the Practice form with the suggested topic and difficulty.
- **Visual Progress Momentum:** By combining `Progress` bars from Material Tailwind with real-time XP tracking, the UI creates a "Positive Feedback Loop" that gamifies the learning process.
- **Rationale:** Minimizing "Decision Fatigue" is a key UX goal. By telling the user exactly what to do next based on their unique history, we increase the platform's stickiness and educational efficacy.

## Design System: "Cosmic Glass"
...

## Architecture & State
The app is built around a set of **Context Providers** in `src/context/`:
- `AuthContext`: Manages user login state, JWT storage, and logout.
- `NotificationContext`: Provides a unified toast/alert system for the entire app.
- `ThemeContext`: Handles light/dark theme switching.
- `PaywallContext`: (Upcoming/Mocked) For managing premium feature access.

## Page Layouts
- **Public Pages:** Landing page, Login, Register. High-impact visuals to convert users.
- **Dashboard Pages:**
    - `Statistics`: Overview of practice progress and accuracy.
    - `Practice Builder`: Form to configure and start an AI practice session.
    - `Study Plan Explorer`: Interface for viewing and managing AI-generated study paths.

## Component Library
- **`AICoachCard`**: A specialized component that displays AI feedback in a friendly, "coach-like" manner.
- **`RecommendationCard`**: Suggests next steps or weak areas to focus on.
- **`AppBackdrop`**: Ensures the "Cosmic Glass" aesthetic is consistent across all views.
- **`ui/`**: Reusable generic components like Buttons, Inputs, and Cards, customized with Material Tailwind.

## API Integration
Located in `src/api.js`, the app uses an axios instance with **interceptors**:
- **Request Interceptor:** Automatically attaches the JWT `Bearer` token from `localStorage` to every outgoing request.
- **Response Interceptor:** (Planned) Handles 401 Unauthorized errors by redirecting to login.

## Best Practices
- **Feature-based Folder Structure:** Related components and logic are grouped together.
- **Responsive Design:** Fully mobile-responsive using Tailwind's layout utilities.
- **SEO Ready:** Includes meta tags and semantic HTML5 for better accessibility and search visibility.

---

[Back to Overview](./overview.md)
