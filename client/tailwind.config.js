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
          primary: '#0F4C81',    // Azul Profissional
          secondary: '#4DB6AC',  // Verde Água
          background: '#F4F7F6', // Cinza muito claro
          text: '#334155'        // Texto escuro suave
        }
      },
    },
  },
  plugins: [],
}