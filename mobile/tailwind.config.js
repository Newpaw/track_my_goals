/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#EBEAFD',
          100: '#D7D5FB',
          200: '#AFABF8',
          300: '#8781F4',
          400: '#5F57F1',
          500: '#4F46E5',
          600: '#2A20D9',
          700: '#211AAB',
          800: '#18137D',
          900: '#0F0C4F'
        },
        secondary: {
          DEFAULT: '#10B981',
          50: '#E6F6F1',
          100: '#CCEEE3',
          200: '#99DDC7',
          300: '#66CCAB',
          400: '#33BB8F',
          500: '#10B981',
          600: '#0D9367',
          700: '#0A6E4D',
          800: '#064A33',
          900: '#03251A'
        }
      }
    },
  },
  plugins: [],
}