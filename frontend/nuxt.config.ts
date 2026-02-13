/**
This file is part of <opsi-webgui> opsiconfd addon .
opsiconfd is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json'

const CONFD_PORT: string = process.env.OPSICONFD_PORT ?? '4447'
const ADDON_PORT: number = parseInt(process.env.ADDON_DEV_PORT ?? '7777')
const ADDON_PATH: string = '/addons/opsi-webgui'
export default defineNuxtConfig({
  compatibilityDate: '2026-01-26',
  devtools: { enabled: true },

  typescript: {
    typeCheck: false,
    shim: false,
    tsConfig: {
      exclude: ['./node_modules/', './dist/'],
      compilerOptions: {
        strict: false,
        skipLibCheck: true,
        noEmit: true,
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        isolatedModules: true,
        verbatimModuleSyntax: true,
      },
    },
  },

  imports: {
    autoImport: true,
    global: true,
    imports: [
      {
        from: 'pinia',
        imports: ['defineStore', 'acceptHMRUpdate', 'storeToRefs']
      },
      {
        from: 'vue',
        imports: ['reactive']
      }
    ],
    dirs: [
      'composables/**',
      'utils/**',
      'stores/**'
    ]
  },

  components: {
    global: true,
    dirs: [
      {
        path: '~/components',
        global: true,
      },
    ],
  },
  ssr: false,
  vite: { plugins: [tailwindcss()] },
  css: ['./app/assets/css/main.css'],
  devServer: {
    port: ADDON_PORT,
    https: {
      key: 'certificates/server.key',
      cert: 'certificates/server.crt',
    },
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
    '@primevue/nuxt-module',
    '@element-plus/nuxt',
  ],
  app: {
    baseURL: ADDON_PATH + '/app',
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: ADDON_PATH + '/app/favicon.ico',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      OPSICONFD_PORT: CONFD_PORT,
      BASE_PAGE: '/clients',
      packageVersion: pkg.version,
      API_PATH: ADDON_PATH + '/api',
      OWN_PATH: ADDON_PATH + '/app',
      NUXT_PUBLIC_API_BASE:
        process.env.NODE_ENV === 'production' ? '' : 'https://localhost:' + CONFD_PORT,
    },
  },
  i18n: {
    detectBrowserLanguage: false,
    strategy: 'no_prefix',
    defaultLocale: 'de',
    //locales: [{ code: 'de', file: 'de.json' }],
    locales: [{ code: 'en', file: 'opsi-webgui_en.json' }],
  },
  // component libs:
  elementPlus: {
    icon: false,
    defaultLocale: 'de',
  },
  primevue: {
    usePrimeVue: true,
    options: {
      ripple: false,
      pt: {},
      theme: {
        //preset: MyPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primevue',
            order: 'tailwind-base, primevue, tailwind-utilities',
          },
        },
      },
    },
    components: {
      prefix: 'P', // usage: <p-button>  or <PButton />
      exclude: ['Toast', 'Editor', 'Chart'],
    },
    directives: {
      prefix: 'P', // usage: v-p-tooltip
      include: ['Tooltip'],
    },
  },
})
