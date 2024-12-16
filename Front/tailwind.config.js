/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  mode: 'jit',
  purge: ['./pages/**/*.{vue,js,ts}', './components/**/*.{vue,js,ts}'],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
  theme: {
    extend: {
      colors: {
        primary: '#3498db',
        secondary: '#f1c40f',
        danger: '#e74c3c',
        success: '#2ecc71',
        info: '#34495e',
        warning: '#ff9f43',
        gray: {
          lighter: '#f8f9fa',
          light: '#e9ecef',
          DEFAULT: '#dee2e6',
          dark: '#ced4da',
          darker: '#6c757d',
        },
        green: {
          chateau: '#40B569'
        }
      }
    }
  }
}

