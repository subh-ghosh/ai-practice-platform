import { useTheme } from "@/context/ThemeProvider.jsx";

export default function ToggleDarkMode({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`btn-ghost min-w-[40px] ${className}`}
    >
      {/* Sun */}
      <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" className={isDark ? "hidden" : ""}>
        <path fill="currentColor" d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.5-3.5a1 1 0 0 1-1 1H16a1 1 0 1 1 0-2h2.5a1 1 0 0 1 1 1ZM12 17a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V18a1 1 0 0 1 1-1ZM5.5 12a1 1 0 0 1 1-1H9a1 1 0 1 1 0 2H6.5a1 1 0 0 1-1-1Zm10.95 5.45a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 1 1-1.41 1.41l-1.06-1.06a1 1 0 0 1 0-1.41ZM6.08 5.08a1 1 0 0 1 1.41 0L8.55 6.14a1 1 0 1 1-1.41 1.41L6.08 6.49a1 1 0 0 1 0-1.41Zm11.36 0a1 1 0 0 1 0 1.41L16.38 7.55a1 1 0 0 1-1.41-1.41l1.06-1.06a1 1 0 0 1 1.41 0ZM6.08 17.92a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 1 1-1.41 1.41L6.08 19.33a1 1 0 0 1 0-1.41Z"/>
      </svg>
      {/* Moon */}
      <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" className={isDark ? "" : "hidden"}>
        <path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z"/>
      </svg>
      <span className="sr-only">{isDark ? "Switch to light mode" : "Switch to dark mode"}</span>
    </button>
  );
}
