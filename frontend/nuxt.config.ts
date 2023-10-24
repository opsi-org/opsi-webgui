
// @ts-nocheck

// import fs from 'fs'
// import pkg from './package.json'
// import { defineNuxtConfig } from 'nuxt'

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
    port: 8888,
    https: { // development
      key: '.config/https/server.key',
      cert: '.config/https/server.crt'
    }
  },

  runtimeConfig: {
    public: {
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
    // plugins: [
    //   Icons({
    //     // the feature below is experimental ⬇️
    //     autoInstall: true
    //   })
    // ]
  },
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    // '~/assets/scss/bv-colors.scss',
    '~/assets/scss/index.scss'
  ],
  elementPlus: {
    // icon: 'ElIcon',
    importStyle: 'scss',
    themes: ['dark'],
  },
  imports: {
    dirs: ['store'],
  },
})
