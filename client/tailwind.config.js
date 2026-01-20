/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0F4C81',   // Azul Profissional
          secondary: '#4DB6AC', // Verde Água
          dark: '#2C3E50',      // Texto
          light: '#F4F7F6',     // Fundo
        }
      },
    },
  },
  plugins: [],
}