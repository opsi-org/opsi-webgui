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
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],

  // Bundle all used icons into the client JS at build time.
  // Without this, @nuxt/icon fetches icons from the Iconify API at runtime,
  // which fails in air-gapped / offline environments (blank white screen).
  // Requires @iconify-json/heroicons, @iconify-json/lucide, and
  // @iconify-json/simple-icons as devDependencies.
  icon: {
    clientBundle: {
      // Scan all Vue/TS files at build time to discover used icons and bundle them.
      // Include .ts files so useIcons.ts (which defines all icon names) is scanned.
      scan: {
        globInclude: ['**/*.{vue,jsx,tsx,ts,md,mdc,mdx}'],
      },
      // Nuxt UI default icons (from node_modules/@nuxt/ui, not reached by scan).
      // These are used internally by UButton, USelect, UInput, UTable, etc.
      icons: [
        'lucide:arrow-down',
        'lucide:arrow-left',
        'lucide:arrow-right',
        'lucide:arrow-up',
        'lucide:arrow-up-right',
        'lucide:check',
        'lucide:chevron-down',
        'lucide:chevron-left',
        'lucide:chevron-right',
        'lucide:chevron-up',
        'lucide:chevrons-left',
        'lucide:chevrons-right',
        'lucide:circle-alert',
        'lucide:circle-check',
        'lucide:circle-x',
        'lucide:copy',
        'lucide:copy-check',
        'lucide:ellipsis',
        'lucide:eye',
        'lucide:eye-off',
        'lucide:file',
        'lucide:folder',
        'lucide:folder-open',
        'lucide:grip-vertical',
        'lucide:hash',
        'lucide:info',
        'lucide:lightbulb',
        'lucide:loader-circle',
        'lucide:menu',
        'lucide:minus',
        'lucide:monitor',
        'lucide:moon',
        'lucide:panel-left-close',
        'lucide:panel-left-open',
        'lucide:plus',
        'lucide:rotate-ccw',
        'lucide:search',
        'lucide:square',
        'lucide:sun',
        'lucide:triangle-alert',
        'lucide:upload',
        'lucide:x',
      ],
    },
    // Never fall back to the external Iconify API — all icons must be bundled
    fallbackToApi: false,
  },

  fonts: {
    families: [
      { name: 'Open Sans', weights: [300, 400, 500, 600, 700] },
      { name: 'Montserrat', weights: [400, 500, 600, 700] },
      { name: 'Roboto Mono', weights: [400, 500] },
    ],
    defaults: {
      fallbacks: {
        serif: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        'sans-serif': ['ui-sans-serif', 'system-ui', 'sans-serif'],
        monospace: ['ui-monospace', 'monospace'],
      },
    },
  },

  // Disable store auto-scanning to prevent false-positive auto-import
  // of internal Pinia properties (state, storage, pick).
  // All stores use explicit imports.
  pinia: {
    storesDirs: [],
  },

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
      '/depot': {
        target: 'https://localhost:' + CONFD_PORT + '/depot',
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
