/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors') // Import colors

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
        colors: {
            // Add a primary color palette (e.g., teal)
            primary: colors.teal,
            // You can also add secondary, accent, etc.
        },
        fontFamily: {
            // Set Inter as the default sans-serif font
             sans: ['Inter var', 'system-ui', 'sans-serif'],
        },
    },
  },
  plugins: [],
} 