/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'legal-green': '#1e5f4f',
        'legal-green-dark': '#0f3d31',
        'legal-green-light': '#2d8a72',
        'warm-bg': '#faf9f7',
        'warm-gray': '#e8e6e1',
      },
    },
  },
  plugins: [],
}
