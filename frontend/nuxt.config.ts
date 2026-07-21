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
const localeDir = path.join(__dirname, 'i18n', 'locales')
const localeNameMap: Record<string, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
}
const locales = fs
  .readdirSync(localeDir)
  .filter((file) => /^opsi-webgui_[a-z-]+\.json$/i.test(file))
  .map((file) => {
    const code = file.replace(/^opsi-webgui_/, '').replace(/\.json$/i, '')
    return {
      code,
      file,
      name: localeNameMap[code] || code.toUpperCase(),
    }
  })

const localeByCode = new Map(locales.map((locale) => [locale.code, locale]))
const priorityCodes = ['en', 'de', 'fr']

const prioritizedLocales = priorityCodes
  .map((code) => localeByCode.get(code))
  .filter((locale): locale is NonNullable<typeof locale> => !!locale)

const communityLocales = locales
  .filter((locale) => !priorityCodes.includes(locale.code))
  .sort((a, b) => a.code.localeCompare(b.code))

const orderedLocales = [...prioritizedLocales, ...communityLocales]

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

  // Bundle all used icons at build time to work in offline environments.
  icon: {
    clientBundle: {
      scan: {
        globInclude: ['**/*.{vue,jsx,tsx,ts,md,mdc,mdx}'],
      },
      // Nuxt UI default icons (from node_modules/@nuxt/ui).
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

  pinia: {
    storesDirs: [],
  },

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
    ...(process.env.NITRO_OUTPUT_DIR ? { output: { dir: process.env.NITRO_OUTPUT_DIR } } : {}),
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
    locales: orderedLocales,
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

  vite: {
    plugins: [
      {
        name: 'fix-checker-runtime-base',
        enforce: 'pre',
        resolveId(id: string) {
          if (id.endsWith('@vite-plugin-checker-runtime') && !id.startsWith('virtual:')) {
            return 'virtual:@vite-plugin-checker-runtime'
          }
        },
      },
    ],
  },

  css: ['~/assets/styles/main.css'],
})
