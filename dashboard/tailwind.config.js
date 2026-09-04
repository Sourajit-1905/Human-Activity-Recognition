/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:     "#0F172A",
        surface:  "#1E293B",
        surface2: "#243044",
        accent:   "#2563EB",
        muted:    "#64748B",
        border:   "#334155",
        textprimary:   "#F1F5F9",
        textsecondary: "#94A3B8",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}