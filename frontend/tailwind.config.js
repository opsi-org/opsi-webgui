// const defaultTheme = require('tailwindcss/defaultTheme')
// const
export default {
  content: [
    './components/**/*.{vue,js,ts,tsx}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts,tsx}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'opsi-blue': 'var(--color-opsi-blue)',
        'opsi-red': 'var(--color-opsi-red)',
      },
      width: {
        '1/1': '100%',
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
      },
      minWidth: {
        '1/1': '100%',
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
      },
      maxWidth: {
        '1/1': '100%',
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
      },
      minHeight: {
        '1/4': '25vh',
        '1/2': '50vh',
        '3/4': '75vh',
        '192': '48rem',
      },
      height: {
        '128': '32rem',
        '192': '48rem',
      },
      fontFamily: {
        // usage by class 'font-logo' etc. or update tailwind.css to set font for specific tags
        'logo': ['MontserratAlt1', 'sans-serif'],
        'heading': ['Montserrat', 'sans-serif'],
        'sans': ['OpenSans', 'sans-serif'],
        'mono': ['DroidSansMono', 'monospace'],
      },
    },
  },
  plugins: [],
}