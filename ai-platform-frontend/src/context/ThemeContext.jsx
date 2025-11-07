// This shim re-exports from ThemeProvider so both paths work safely.
// If some components still import "@/context/ThemeContext.jsx",
// they’ll still get the same ThemeProvider and useTheme hook.

export { ThemeProvider, useTheme } from "./ThemeProvider.jsx";
