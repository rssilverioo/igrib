/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#32AE5D',
          dark: '#032B2A',
          light: '#E6F4EA',
        }
      }
    },
  },
  plugins: [],
};