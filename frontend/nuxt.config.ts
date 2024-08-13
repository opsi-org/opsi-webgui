// @ts-nocheck

import pkg from './package.json'

const CONFD_PORT = process.env.OPSICONFD_PORT || 4447
console.log("---------------------------------------------------")
console.log('OPSI CONFD PORT', CONFD_PORT)
console.log("---------------------------------------------------")

export default defineNuxtConfig({
  build: {
    analyze: true,
    hardSource: true,
    webpack: {
      loaders: {
        vue: {
          hotReload: false,
        },
      },
      optimization: {
        usedExports: true,
      },
    },
  },
  ignore: [
    '**/tests-configs/**', '**/*.test.component.ts',
    '**/*.test.accessibility.ts', '**/*.test.usecase.ts', '**/*.test.screenshot.ts'
  ],
  devtools: {
    enabled: false,
  },
  typescript: {
    typeCheck: true,
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
    baseURL: '/addons/webgui/app',
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }],
    },
  },
  static: {
    prefix: false,
  },
  runtimeConfig: {
    public: {
      OPSICONFD_PORT: CONFD_PORT,
      BASE_PAGE: '/clients',
      packageVersion: pkg.version,
      API_PATH: '/addons/webgui/api',
      OWN_PATH: '/addons/webgui/app',
      NUXT_PUBLIC_API_BASE: (process.env.NODE_ENV === 'production') ? '' : 'https://localhost:' + CONFD_PORT,
    },
  },
  modules: [
    '@nuxtjs/i18n',
    'nuxt-primevue',
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
    '@pinia-plugin-persistedstate/nuxt',
  ],
  piniaPersistedState: {
    key: (id) => `opsiui-${id}`,
    storage: 'localStorage',
    debug: true,
  },
  css: [
    '~/assets/scss/index.scss',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/scss/opsi.scss" as *;`
        },
      },
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
    },
    components: {
      prefix: 'P',
      include: ['ContextMenu', 'DataTable', 'Column', 'ColumnGroup', 'Row', 'Paginator', 'Dropdown', 'VirtualScroller', 'Skeleton'],
      exclude: ['Toast'],
    },
  },
  imports: {
    dirs: ['store'],
  },
})

