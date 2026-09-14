/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0A0A0A",
        surface: "#111111",
        surface2: "#1A1A1A",
        accent: "#2563EB",
        muted: "#6B7280",
        border: "#2A2A2A",
        textprimary: "#F1F5F9",
        textsecondary: "#9CA3AF",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}