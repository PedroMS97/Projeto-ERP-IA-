/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6A5AE0",
        background: "#F8F9FE",
        card: "#FFFFFF",
        text: "#1e1e2d",
        textMuted: "#a0a0a0",
        success: "#00c48c",
        danger: "#ff6b6b",
        warning: "#ffd166"
      }
    },
  },
  plugins: [],
}
