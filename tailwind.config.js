/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#121212',    // Very dark gray, almost black
          secondary: '#1E1E1E',  // Slightly lighter black
          surface: '#242424',    // Surface color
          text: '#E0E0E0',       // Light gray for text
        }
      },
      backgroundColor: {
        dark: '#121212',  // Very dark gray, almost black
      }
    },
  },
  plugins: [],
} 