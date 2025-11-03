/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  // --- ADD THE PLUGINS SECTION ---
  plugins: [
    require("@tailwindcss/typography"),
  ],
  // -----------------------------
});