package com.practice.aiplatform.gamification;

import lombok.Getter;

@Getter
public enum Badge {
    FIRST_STEPS("First Steps", "Created your first study plan", "🚀"),
    QUIZ_MASTER("Quiz Master", "Scored 100% on 3 quizzes", "🧠"),
    STREAK_WARRIOR("Streak Warrior", "Maintained a 7-day streak", "🔥"),
    WEEKEND_GRINDER("Weekend Grinder", "Studied on a Saturday or Sunday", "☕"),
    EARLY_BIRD("Early Bird", "Completed a task before 8 AM", "🌅"),
    NIGHT_OWL("Night Owl", "Completed a task after 10 PM", "🦉");

    private final String displayName;
    private final String description;
    private final String icon;

    Badge(String displayName, String description, String icon) {
        this.displayName = displayName;
        this.description = description;
        this.icon = icon;
    }
}