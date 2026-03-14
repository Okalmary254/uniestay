/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          400: '#1D9E75',
          600: '#0F6E56',
          800: '#085041',
        },
        blue: {
          50:  '#E6F1FB',
          100: '#B5D4F4',
          400: '#378ADD',
          600: '#185FA5',
          800: '#0C447C',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
