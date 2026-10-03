/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lawNavy: {
          900: '#070c1d',
          800: '#0a1128',
          700: '#101a38',
          600: '#16234b'
        },
        lawGold: {
          300: '#ffe082',
          400: '#dfb15b',
          500: '#c69214',
          600: '#a67709',
          700: '#875f04'
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif']
      }
    },
  },
  plugins: [],
}
