/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '1/1': '100%',
        '1/2': '50%',
        '1/3': '33%',
        '2/3': '66%',
      },
      minWidth: {
        '1/1': '100%',
        '1/2': '50%',
        '1/3': '33%',
        '2/3': '66%',
      },
      maxWidth: {
      '1/1': '100%',
      '1/2': '50%',
      '1/3': '33%',
      '2/3': '66%',
      },
      minHeight: {
        '1/4': '25vh',
        '1/2': '50vh',
        '3/4': '75vh',
        '192': '48rem',
      },
      height: {
        // 96*2: 24rem*2 // 384px*2
        '192': '48rem;',
      },
      // backgroundColor: {
      //   'transparent': 'transparent'
      // }
    },
  },
  plugins: [],
}

