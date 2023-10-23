
// import fs from 'fs'
// import pkg from './package.json'

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
  ssr: false,
  devServer: {
    port: 8887,
    https: { // development
      key: '.config/https/server.key',
      cert: '.config/https/server.crt'
    }
  },
  // public: {
  //   APIPATH: '/addons/webgui'
  // },
  pages: true, // not necessary, will be done auttttomatically
  modules: [
    // '@element-plus/nuxt',
    '@nuxtjs/i18n',

    '@bootstrap-vue-next/nuxt',

    '@element-plus/nuxt',
    // '@nuxtjs/color-mode',

    // store (alternative to vuex)
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
    '@pinia-plugin-persistedstate/nuxt',
    // 'nuxt-monaco-editor'
  ],

  // // colorMode
  // colorMode: {
  //   classSuffix: '',
  // },
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
    'bootstrap/dist/css/bootstrap.min.css',
    // '~/assets/scss/bv-colors.scss',
    '~/assets/scss/index.scss'
  ],
  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss',
    themes: ['dark'],
  },
  imports: {
    dirs: ['store'],
  },
})
