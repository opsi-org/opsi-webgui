// @ts-nocheck

import pkg from './package.json'

const CONFD_PORT = process.env.OPSICONFD_PORT || 4447
console.log("---------------------------------------------------")
console.log('OPSI CONFD PORT', CONFD_PORT)
console.log("---------------------------------------------------")

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    analyze: true,
    hardSource: true,  // reuse cache between builds
    webpack: {
      loaders: {
        vue: {
          hotReload: false, // disable HMR
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
  webpack: {
    loaders: {
      vue: {
        hotReload: true,
      }
    }
  },
  typescript: {
    typeCheck: true
  },
  ssr: false,
  devServer: {
    port: 8888,
    https: { // development
      key: '.config/https/server.key',
      cert: '.config/https/server.crt'
    }
  },
  app: {
    baseURL: '/addons/webgui/app',
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }],
    }
  },

  static: {
    prefix: false
  },
  runtimeConfig: {
    public: {
      OPSICONFD_PORT: CONFD_PORT,
      BASE_PAGE: '/clients',
      packageVersion: pkg.version,
      API_PATH: '/addons/webgui/api', // only default value is useApiFetch composable (can be overwritten for specific api calls)
      OWN_PATH: '/addons/webgui/app', // only default value is useApiFetch composable (can be overwritten for specific api calls)
      NUXT_PUBLIC_API_BASE: (process.env.NODE_ENV === 'production') ? '' : 'https://localhost:' + CONFD_PORT
      // NUXT_PUBLIC_API_BASE: process.env.BASE_URL
    },
  },
  pages: true, // not necessary, will be done auttttomatically
  modules: [
    '@nuxtjs/i18n',
    'nuxt-primevue',
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    // store (alternative to vuex)
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
    '@pinia-plugin-persistedstate/nuxt',
  ],
  piniaPersistedState: {
    key: (id: string) => `opsiui-${id}`,
    storage: 'localStorage',
    debug: true,
  },
  tailwindcss: {
    viewer: false,
  },

  vueuse: {
    ssrHandlers: true,
  },
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
    'primevue/resources/themes/md-dark-indigo/theme.css',
    '~/assets/scss/index.scss', // ep import colors
  ],
  elementPlus: {
    icon: false,
    importStyle: "scss",
    themes: ['dark'], // from docs: "import style css or sass(scss) with components, disable automatically import styles with false."
    defaultLocale: 'de',
  },

  primevue: {
    usePrimeVue: true,
    options: {
      ripple: false,
      pt: {}
    },

    components: {
      prefix: 'P',
      include: ['ContextMenu', 'DataTable', 'Column', 'ColumnGroup', 'Row', 'Paginator', 'Dropdown', 'VirtualScroller', 'Skeleton'],
      exclude: ['Toast']
    },

    composables: {
      include: []
    }
  },

  imports: {
    dirs: ['store'],
  },
})
