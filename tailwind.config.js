/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#06070b",
        bgElevated: "#0d0f15",
        card: "#171922",
        cardSoft: "#1f2230",
        text: "#f8fafc",
        muted: "#9aa3b2",
        line: "#2c3140",
        accent: "#4f2ac8",
        accentSoft: "#7152e7",
        accentGlow: "#8b75f5",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};
