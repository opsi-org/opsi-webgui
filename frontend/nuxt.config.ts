// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from 'fs'
import path from 'path'

const CONFD_PORT: string = process.env.OPSICONFD_PORT ?? '4447'
const ADDON_PORT: number = parseInt(process.env.ADDON_DEV_PORT ?? '3000')
const ADDON_PATH: string = '/addons/webgui'
const SESSION_EXPIRY_SEC: number = 60 * 30 // Default 30 minutes

import pkg from './package.json'

// HTTPS certificates paths for development
const certsPath = path.join(__dirname, 'certs')
const keyPath = path.join(certsPath, 'server.key')
const certPath = path.join(certsPath, 'server.crt')
const httpsConfig =
  fs.existsSync(keyPath) && fs.existsSync(certPath) ? { key: keyPath, cert: certPath } : false

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: false,

  alias: {
    '@': './app',
    '~/': './app',
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],

  // Color mode configuration - uses cookies for SSR hydration and persistence
  colorMode: {
    preference: 'light', // Default theme
    fallback: 'light',
    storageKey: 'opsi-webgui-color-mode',
    classSuffix: '',
  },
  app: {
    baseURL: ADDON_PATH + '/app',
    head: {
      title: 'opsi-WebGUI',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'OPSI Web-based Graphical User Interface for device management',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: ADDON_PATH + '/app/favicon.ico',
        },
      ],
    },
  },

  devServer: {
    port: ADDON_PORT,
    https: httpsConfig,
  },

  // Proxy API requests to backend during development to avoid CORS issues
  nitro: {
    devProxy: {
      '/addons/webgui/api': {
        target: 'https://localhost:' + CONFD_PORT + '/addons/webgui/api',
        changeOrigin: true,
        secure: false,
      },
      '/file-transfer': {
        target: 'https://localhost:' + CONFD_PORT + '/file-transfer',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  runtimeConfig: {
    public: {
      packageVersion: pkg.version,
      OPSICONFD_PORT: CONFD_PORT,
      API_PATH: ADDON_PATH + '/api',
      OWN_PATH: ADDON_PATH + '/app',
      BASE_PAGE: '/clients',
      SESSION_EXPIRY: SESSION_EXPIRY_SEC,
      // In development, use empty string since we proxy through the dev server
      // In production, the API is served from the same origin
      NUXT_PUBLIC_API_BASE: '',
    },
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'de',
    locales: [
      { code: 'de', file: 'opsi-webgui_de.json', name: 'Deutsch' },
      { code: 'en', file: 'opsi-webgui_en.json', name: 'English' },
    ],
    bundle: {
      fullInstall: false,
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'opsi-webgui-user-locale',
      fallbackLocale: 'de',
    },
  },

  typescript: {
    typeCheck: true,
  },

  css: ['~/assets/styles/main.css'],
})
