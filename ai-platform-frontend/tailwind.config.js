import withMT from "@material-tailwind/react/utils/withMT";
import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default withMT({
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "blue-gray": colors.slate,
        background: "rgb(var(--bg) / <alpha-value>)",
        foreground: "rgb(var(--fg) / <alpha-value>)",
        muted: { DEFAULT: "rgb(var(--muted) / <alpha-value>)", foreground: "rgb(var(--muted-fg) / <alpha-value>)" },
        primary: { DEFAULT: "rgb(var(--primary) / <alpha-value>)", foreground: "rgb(var(--on-primary) / <alpha-value>)" },
        border: "rgb(var(--border) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        // Glass Colors
        glass: {
          100: "rgba(255, 255, 255, 0.1)",
          200: "rgba(255, 255, 255, 0.2)",
          300: "rgba(255, 255, 255, 0.3)",
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Arial"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo"],
      },
      borderRadius: { xl: "0.9rem", "2xl": "1.25rem" },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)",
        // New Shadows for Glass effect
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
      },
      // Custom Animations
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        ":root": {
          "--bg": "255 255 255",
          "--fg": "17 24 39",
          "--muted": "243 244 246",
          "--muted-fg": "107 114 128",
          "--primary": "59 130 246",
          "--on-primary": "255 255 255",
          "--border": "229 231 235",
          "--card": "255 255 255",
          "--ring": "59 130 246",
        },
        ".dark": {
          "--bg": "10 10 11",
          "--fg": "229 231 235",
          "--muted": "31 31 34",
          "--muted-fg": "163 163 170",
          "--primary": "99 102 241",
          "--on-primary": "236 242 255",
          "--border": "38 38 42",
          "--card": "17 17 19",
          "--ring": "99 102 241",
        },
      });

      // Premium modern dark scrollbars injected into Tailwind Base
      addBase({
        // Size
        "html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar": {
          width: "7px",
          height: "7px",
        },
        // Track: deep charcoal with a faint inner edge glow
        "html::-webkit-scrollbar-track, body::-webkit-scrollbar-track, *::-webkit-scrollbar-track": {
          background: "#0d0d0f",
          borderLeft: "1px solid rgba(255, 255, 255, 0.04)",
        },
        // Thumb: semi-transparent white pill with outer fade border
        "html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb, *::-webkit-scrollbar-thumb": {
          background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%)",
          borderRadius: "99px",
          border: "2px solid #0d0d0f",
          backgroundClip: "padding-box",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.05)",
          transition: "background 0.2s ease, box-shadow 0.2s ease",
        },
        // Hover: electric blue glow
        "html::-webkit-scrollbar-thumb:hover, body::-webkit-scrollbar-thumb:hover, *::-webkit-scrollbar-thumb:hover": {
          background: "linear-gradient(180deg, rgba(59,130,246,0.85) 0%, rgba(99,102,241,0.7) 100%)",
          boxShadow: "0 0 12px rgba(59,130,246,0.6), inset 0 1px 0 rgba(255,255,255,0.25)",
          border: "2px solid rgba(0,0,0,0.5)",
        },
        // Firefox
        "html, body, *": {
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.2) #0d0d0f",
        },
      });
    },
  ],
});