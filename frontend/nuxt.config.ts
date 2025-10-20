/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
/* eslint-disable no-console */

import path from 'path'
import fs from 'fs'

import pkg from './package.json'
import MyPreset from './assets/scss/primevue'

const CONFD_PORT: string = process.env.OPSICONFD_PORT ?? '4447'
const WEBUI_PORT_STR: string = process.env.PORT ?? '8888'
const WEBUI_PORT: number = parseInt(WEBUI_PORT_STR)
// do not change following line, cause it is automatically patched by the build_production_local.sh script
const ADDON_PATH: string = '/addons/webgui'

// Reading all locale files for dynamic configuration of nuxt/i18n
const langs: { [key: string]: { code: string; name: string; file: string } } = {}
const dir = './locale/'
const fullPath = path.join(__dirname, dir)
const files = fs.readdirSync(fullPath)
console.log('DEBUG: Reading locales')
try {
  // gets all internationalization files, which are located in 'dir'
  files.forEach((file) => {
    if (/opsi-webgui_(.*)\.json/.test(file)) {
      const l = file.match(/opsi-webgui_(.*)\.json/)
      if (!l) return
      console.log('  found locale:', l[1], 'in file', file)
      try {
        //const json = require(fullPath + '/' + file)
        //langs[l[1]] = json
        langs[l[1]] = { code: l[1], name: l[1], file: file }
      } catch (error) {
        console.log('Error reading file ', file, error)
      }
    }
  })
} catch (error) {
  console.log(error)
}

if (process.env.NODE_ENV === 'development') {
  console.log('---------------------------------------------------')
  console.log('OPSICONFD PORT', CONFD_PORT, ', env: ', process.env.OPSICONFD_PORT)
  console.log('WEBGUI PORT', WEBUI_PORT_STR, WEBUI_PORT)
  console.log('ADDON PATH', ADDON_PATH)
  console.log('VERSION', pkg.version)
  console.log('LOCALES ', Object.keys(langs))
  console.log(Object.values(langs))
  console.log('---------------------------------------------------')
}

export default defineNuxtConfig({
  compatibilityDate: '2025-01-23',
  experimental: {
    appManifest: false,
    payloadExtraction: false,
  },
  build: {
    analyze: false,
  },
  sourcemap: false,
  ignore: [
    '**/tests-configs/**',
    '**/*.test.component.ts',
    '**/*.test.accessibility.ts',
    '**/*.test.usecase.ts',
    '**/*.test.screenshot.ts',
  ],
  devtools: {
    enabled: false,
  },
  typescript: {
    typeCheck: true,
    tsConfig: {
      compilerOptions: {
        skipLibCheck: true,
        noEmit: true,
      },
    },
  },
  ssr: false,
  devServer: {
    port: WEBUI_PORT,
    https: {
      key: '.config/https/server.key',
      cert: '.config/https/server.crt',
    },
  },
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
  modules: [
    '@nuxtjs/i18n',
    '@primevue/nuxt-module',
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/eslint',
  ],
  i18n: {
    //vueI18n: './i18n.config.js', // seems not to work with update nuxt/i18n to 10.1.0
    langDir: '../locale/',
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: Object.values(langs) || [],
  },
  piniaPluginPersistedstate: {
    key: 'opsiwui-%id',
    storage: 'localStorage',
    debug: true,
  },
  css: ['~/assets/scss/index.scss', '~/assets/scss/tailwind.scss'],
  vite: {
    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core'],
      esbuildOptions: {
        target: 'esnext',
      },
    },
    cacheDir: 'node_modules/.vite_cache',
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/scss/opsi.scss" as *;`,
        },
      },
    },
    server: {
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/test-results/**',
          '**/tests/**',
          '**/tests-configs/**',
          '**/tests-screenshots/**',
        ],
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
    },
    esbuild: {
      target: 'esnext',
    },
  },
  tailwindcss: {
    viewer: false,
  },
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
        preset: MyPreset,
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
  imports: {
    dirs: ['store'],
  },
})
