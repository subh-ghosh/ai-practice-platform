/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // This is the key change:
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
});