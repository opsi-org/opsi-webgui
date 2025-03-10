/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
/* eslint-disable no-console */
import pkg from './package.json'
import MyPreset from './assets/scss/primevue'

const CONFD_PORT: string = process.env.OPSICONFD_PORT ?? '4447'
// do not change following line, cause it is automatically patched by the build_production_local.sh script
const ADDON_PATH: string = '/addons/webgui'

if (process.env.NODE_ENV === 'development') {
  console.log('---------------------------------------------------')
  console.log('OPSICONFD PORT', CONFD_PORT)
  console.log('ADDON PATH', ADDON_PATH)
  console.log('VERSION', pkg.version)
  console.log('---------------------------------------------------')
}

export default defineNuxtConfig({
  compatibilityDate: '2025-01-23',
  experimental: { appManifest: false },
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
    port: 8888,
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
      // link: [{ rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }],
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
        process.env.NODE_ENV === 'production'
          ? ''
          : 'https://localhost:' + CONFD_PORT,
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
    vueI18n: './i18n.config.js', // custom path example
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
