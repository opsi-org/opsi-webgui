/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import pkg from './package.json'
// import { defineNuxtConfig } from 'nuxt/config'
// const defineNuxtConfig: DefineNuxtConfig(input: InputConfig<NuxtConfig, ConfigLayerMeta>) => InputConfig<NuxtConfig, ConfigLayerMeta>

const CONFD_PORT: string = process.env.OPSICONFD_PORT || '4447'
// do not change following line, cause it is automatically patched by the build_production_local.sh script
const ADDON_PATH: string = "/addons/webgui"

console.log('---------------------------------------------------')
console.log('OPSI CONFD PORT', CONFD_PORT)
console.log('ADDON PATH', ADDON_PATH)
console.log('---------------------------------------------------')

export default defineNuxtConfig({
  compatibilityDate: '2024-09-17',
  build: {
    analyze: true,
    // hardSource: true,
  },
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
      link: [{ rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }],
    },
  },
  // static: {
  //   prefix: false,
  // },
  runtimeConfig: {
    public: {
      OPSICONFD_PORT: CONFD_PORT,
      BASE_PAGE: '/clients',
      packageVersion: pkg.version,
      API_PATH: ADDON_PATH + '/api',
      OWN_PATH: ADDON_PATH + '/app',
      NUXT_PUBLIC_API_BASE: process.env.NODE_ENV === 'production' ? '' : 'https://localhost:' + CONFD_PORT,
    },
  },
  modules: [
    '@nuxtjs/i18n',
    'nuxt-primevue',
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/eslint',
  ],
  piniaPluginPersistedstate: {
    key: 'opsiui-%id',
    // key: (id: string) => `opsiui-${id}`,
    storage: 'localStorage',
    debug: true,
  },
  css: ['~/assets/scss/index.scss', '~/assets/css/tailwind.css'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/scss/opsi.scss" as *;`,
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
// } as InputConfig<NuxtConfig, ConfigLayerMeta>
}
)