/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#172B4D', light: '#1e3a6e' },
        primary: { DEFAULT: '#2563EB', light: '#3b82f6' },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        muted: '#64748B',
        surface: '#F5F7FA',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}

