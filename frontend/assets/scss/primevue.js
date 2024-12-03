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
  },
})

export default MyPreset
