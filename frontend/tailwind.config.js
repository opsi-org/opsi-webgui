export default {
  purge: {
    enabled: true, // process.env.NODE_ENV === 'production'
    content: [
      './components/**/*.{vue,js,ts,tsx}',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './plugins/**/*.{js,ts,tsx}',
      './nuxt.config.{js,ts}',
    ],
  },
  theme: {
    extend: {
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
    },
  },
  plugins: [],
}