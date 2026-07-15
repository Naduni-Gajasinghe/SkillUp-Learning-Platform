/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skill: {
          bg: '#ebf0ea',
          dark: '#515654',
          accent: '#4fb28f',
          accentHover: '#3f9d7d',
          border: '#DDE6E1',
          card: '#FFFFFF',
          success: '#4fb28f',
          error: '#E74C3C',
          warning: '#F4B400',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      borderRadius: {
        ui: '12px',
        card: '16px',
        btn: '10px',
        input: '10px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(81, 86, 84, 0.08)',
        card: '0 10px 28px rgba(81, 86, 84, 0.08)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.35s ease-out',
      },
    },
  },
  plugins: [],
}