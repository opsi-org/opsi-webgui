import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'
import { HstNuxt } from '@histoire/plugin-nuxt'
// import './assets/scss/bv-colors.scss'

const CONFD_PORT: string = process.env.OPSICONFD_PORT ?? '4447'
// console.log('OPSI CONFD PORT IN HISTOIRE', CONFD_PORT)

export default defineConfig({
  plugins: [HstVue(), HstNuxt()],
  // autoApplyContrastColor: true,
  collectMaxThreads: 4, // 8 threads takes longer..
  // setupFile: './histoire/histoire-setup.ts',
  setupFile: 'histoire-setup.ts',
  tree: {
    file: (file) => [...file.path.split('/').slice(1, -1), file.title],
    order: 'asc',
  },
  theme: {
    title: 'opsi',
    logo: {
      square: './assets/images/opsi.png',
      light: './assets/images/opsi.png',
      dark: './assets/images/opsi.png',
    },

    colors: {
      // primary: defaultColors.red,
      primary: {
        100: '#8B8B8B', // light menu hovered
        200: '#C0C0C0', // light variant title text
        300: '#565656', // light variant title background hover
        800: '#cb1e58', // light variant title text
        700: '#8B8B8B', // dark variant title background
        900: '#8B8B8B', // dark menu hovered
        50: '#8B8B8B', // both controls row hovered / tabs
        500: '#cb1e58', // both menu icon / buttons hovered
        600: '#3f3f3e', // both menu selected hovered
        400: '#C0C0C0', // dark control / tabs text
      },
    },
    favicon: './public/favicon-bee.ico',
    // './public/images/UIB_1704_2023_OPSI_Logo_Bildmarke_nur_Biene_quer.png',
    // defaultColorScheme: 'dark',
    // darkClass: 'webgui-theme-dark dark', // not whitespaces allowed
    darkClass: 'dark',
    // storeColorScheme: true
    // colors: {
    //   gray: defaultColors.zinc,
    //   primary: defaultColors.cyan
    // }
  },
  // defaultStoryProps: {
  //   // icon: 'carbon:assembly-reference',
  //   // iconColor: '#00c5a5',
  //   // layout: {
  //   //   type: 'grid',
  //   //   width: 300,
  //   // },
  //   // responsiveDisabled: true,
  //   // autoPropsDisabled: true,
  // },
  vite: {
    server: {
      host: '0.0.0.0', // of histoire
      port: 6006,
      https: {
        // development
        key: '.config/https/server.key',
        cert: '.config/https/server.crt',
      },
      proxy: {
        '/addons/webgui/api': {
          target: 'https://localhost:' + CONFD_PORT + '/',
          // changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // additionalData: `@use "@/assets/scss/element/index.scss" as element;`,
          additionalData: `@use "@/assets/scss/opsi.scss" as *;`,
        },
      },
    },
  },
})
