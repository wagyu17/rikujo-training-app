/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#191919',
          700: '#37352f',
          500: '#6b6b6b',
          300: '#9b9a97',
        },
        paper: {
          DEFAULT: '#ffffff',
          50: '#fbfbfa',
          100: '#f7f6f3',
          200: '#ebeae6',
          300: '#dcdad5',
        },
        accent: {
          DEFAULT: '#5b9bd5',
          soft: '#e8f0fa',
          ink: '#2f6aa8',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic UI"',
          'Meiryo',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
