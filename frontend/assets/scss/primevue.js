import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#ebf1fb',
      100: '#d7e3f7',
      200: '#afc7ef',
      300: '#88abe7',
      400: '#608fdf',
      500: '#3f5aa6', // opsi-blue
      600: '#384d94',
      700: '#2d3d75',
      800: '#222d57',
      900: '#171e3a',
    },
    secondary: {
      50: '#fde9f0',
      100: '#fbd1de',
      200: '#f7a3bc',
      300: '#f4759b',
      400: '#f04779',
      500: '#cb1e58', // primary
      600: '#b11b4f',
      700: '#8b153f',
      800: '#650f2f',
      900: '#400a20',
    },
    colorScheme: {
      light: {
        // surface: {
        //   50: '#fdfdfd',
        //   100: '#fbfbfb',
        //   200: '#f7f7f7',
        //   300: '#f2f2f2',
        //   400: '#ebebeb',
        //   500: '#e2e2e2',
        //   600: '#d6d6d6',
        //   700: '#c2c2c2',
        //   800: '#a1a1a1',
        //   900: '#757575',
        //   950: '#595959',
        // },
      },
      dark: {
        surface: {
          50: '#e4e4e4', // Sehr helles Grau
          100: '#cccccc', // Helleres Grau
          200: '#a9a9a7', // Weiches Grau
          300: '#8e8e8d', // Mittelgrau
          400: '#757574', // Dunkleres Grau
          500: '#606060', // Basis-Grau
          600: '#565656', // Anpassung: Der definierte Wert // border
          700: '#4c4c4c', // Stärker dunkler werdend
          800: '#454545', // Tieferes Grau
          900: '#404040', // Kurz vor der Basisfarbe
          950: '#3f3f3e', // Basis: Dunkle Hintergrundfarbe // background
        },
      },
    },
  },
})

export default MyPreset
