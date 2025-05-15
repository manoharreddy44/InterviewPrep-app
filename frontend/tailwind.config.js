/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chart-bg': '#1E1E2D',
        'chart-accent': '#3B82F6',
      },
      height: {
        '420': '420px',
        '320': '320px',
      }
    },
  },
  plugins: [
    require("daisyui"),
  ],
}
