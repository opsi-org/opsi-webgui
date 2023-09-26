
import fs from 'fs'
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
  // devServer: {
  //   https: { // development
  //     key: '.config/https/server.key',
  //     cert: '.config/https/server.crt'
  //   }
  // },
  // public: {
  //   APIPATH: '/addons/webgui'
  // },
  pages: true, // not necessary, will be done auttttomatically
  modules: [
    '@nuxtjs/i18n',
    '@bootstrap-vue-next/nuxt',
    ['@pinia/nuxt', // store (alternative to vuex)
      {
        autoImports: ['defineStore', 'acceptHMRUpdate'],
      }],
    '@pinia-plugin-persistedstate/nuxt',
    // 'nuxt-monaco-editor'
  ],
  css: ['bootstrap/dist/css/bootstrap.min.css'],
  // i18n: {
  //   vueI18n: '.config/nuxt-i18n.js' // custom path example
  // },
  imports: {
    dirs: ['store'],
  },
})
