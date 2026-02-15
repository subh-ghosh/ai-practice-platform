import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeCtx = createContext(undefined);

export function ThemeProvider({ children }) {
  // Force dark mode
  const [theme] = useState("dark");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme: () => { }, // No-op
    toggleTheme: () => { }, // No-op
  }), [theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

export default ThemeProvider;
