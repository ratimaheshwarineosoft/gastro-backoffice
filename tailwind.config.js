/** @type {import('tailwindcss').Config} */

// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}", // Adjust path based on your project structure
    "./node_modules/preline/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};