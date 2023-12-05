
// @ts-nocheck
// import fs from 'fs'
// import pkg from './package.json'
// import { defineNuxtConfig } from 'nuxt'
import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  webpack: {
    loaders: {
      vue: {
        hotReload: true,
      }
    }
  },
  typescript: {
    typeCheck: true
  },
  ssr: false,
  devServer: {
    port: 8888,
    https: { // development
      key: '.config/https/server.key',
      cert: '.config/https/server.crt'
    }
  },
  app: {
    baseURL: '/addons/webgui/app'
  },
  imports: {
    presets: [
      {
        from: 'vue-i18n',
        imports: ['useI18n']
      }
    ]
  },
  // alias: {
  //   'assets': fileURLToPath(new URL('./assets', import.meta.url)),
  //   // 'images': fileURLToPath(new URL('./assets/images', import.meta.url)),
  //   // 'style': fileURLToPath(new URL('./assets/style', import.meta.url)),
  //   // 'data': fileURLToPath(new URL('./assets/other/data', import.meta.url))
  // },
  runtimeConfig: {
    public: {
      BASE_PAGE: '/clients',
      packageVersion: pkg.version,
      API_PATH: '/addons/webgui/api', // only default value is useApiFetch composable (can be overwritten for specific api calls)
      NUXT_PUBLIC_API_BASE: (process.env.NODE_ENV === 'production') ? '' : 'https://localhost:4447'
    },
  },
  pages: true, // not necessary, will be done auttttomatically
  modules: [
    // '@element-plus/nuxt',
    '@nuxtjs/i18n',

    '@bootstrap-vue-next/nuxt',

    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    // '@nuxtjs/color-mode',
    // ['unplugin-icons/nuxt', {
    //   /* options */
    //   scale: 1.2, // Scale of icons against 1em
    //   // defaultStyle: '', // Style apply to icons
    //   // defaultClass: '', // Class names apply to icons
    //   compiler: 'null', // 'vue2', 'vue3', 'jsx', null
    //   autoInstall: true,
    // }],

    // store (alternative to vuex)
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
    '@pinia-plugin-persistedstate/nuxt',
    // 'nuxt-monaco-editor'
  ],

  tailwindcss: {
    // cssPath: '~/assets/css/tailwind.css',
    // configPath: 'tailwind.config',
    // exposeConfig: false,
    // exposeLevel: 2,
    // config: {},
    // injectPosition: 'first',
    viewer: false,
  },
  // // colorMode
  // colorMode: {
  //   classSuffix: '',
  // },

  // vueuse
  vueuse: {
    ssrHandlers: true,
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/scss/element/index.scss" as element;`,
        },
      },
    },
  },
  css: [
    '~/assets/scss/index.scss', // ep import colors
    '~/assets/scss/bv-colors.scss' // bv import colors
  ],
  elementPlus: {
    // useSource: true,
    icon: false,
    importStyle: "scss",
    themes: ['dark'], // from docs: "import style css or sass(scss) with components, disable automatically import styles with false."
    defaultLocale: 'de',
  },
  imports: {
    dirs: ['store'],
  },
})
