
// @ts-nocheck
// import fs from 'fs'
// import pkg from './package.json'
// import { defineNuxtConfig } from 'nuxt'
import pkg from './package.json'

import Tailwind from "primevue/passthrough/tailwind";

// export const hash = Math.floor(Math.random() * 90000) + 10000;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  webpack: {
    loaders: {
      vue: {
        hotReload: true,
      }
    }
  },
  sourcemap: {
    server: false,
    client: false,
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
  // imports: {
  //   presets: [
  //     {
  //       from: 'vue-i18n',
  //       imports: ['useI18n']
  //     }
  //   ]
  // },
  // alias: {
  //   'assets': fileURLToPath(new URL('./assets', import.meta.url)),
  //   // 'images': fileURLToPath(new URL('./assets/images', import.meta.url)),
  //   // 'style': fileURLToPath(new URL('./assets/style', import.meta.url)),
  //   // 'data': fileURLToPath(new URL('./assets/other/data', import.meta.url))
  // },
  runtimeConfig: {
    public: {
      BASE_PAGE: '/clients',
      packageVersion: pkg.version,
      API_PATH: '/addons/webgui/api', // only default value is useApiFetch composable (can be overwritten for specific api calls)
      OWN_PATH: '/addons/webgui/app', // only default value is useApiFetch composable (can be overwritten for specific api calls)
      NUXT_PUBLIC_API_BASE: (process.env.NODE_ENV === 'production') ? '' : 'https://localhost:4447'
      // NUXT_PUBLIC_API_BASE: process.env.BASE_URL
    },
  },
  pages: true, // not necessary, will be done auttttomatically
  modules: [
    // '@element-plus/nuxt',
    '@nuxtjs/i18n',

    '@bootstrap-vue-next/nuxt',

    'nuxt-primevue',
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    // '@nuxtjs/color-mode',
    // ['unplugin-icons/nuxt', {
    //   /* options */
    //   scale: 1.2, // Scale of icons against 1em
    //   // defaultStyle: '', // Style apply to icons
    //   // defaultClass: '', // Class names apply to icons
    //   compiler: 'null', // 'vue2', 'vue3', 'jsx', null
    //   autoInstall: true,
    // }],

    // store (alternative to vuex)
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
    '@pinia-plugin-persistedstate/nuxt',
    // 'nuxt-monaco-editor'
  ],
  piniaPersistedState: {
    // cookieOptions: {
    //   sameSite: 'strict',
    // },
    key: (id: string) => `opsiui-${id}`,
    storage: 'localStorage',
    debug: true,
  },
  tailwindcss: {
    // cssPath: '~/assets/css/tailwind.css',
    // configPath: 'tailwind.config',
    // exposeConfig: false,
    // exposeLevel: 2,
    // config: {},
    // injectPosition: 'first',
    viewer: false,
  },

  // // colorMode
  // colorMode: {
  //   classSuffix: '',
  // },

  // vueuse
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
    // build: {
    //   rollupOptions: {
    //     output: {
    //       entryFileNames: `[name]` + hash + `.js`,
    //       chunkFileNames: `[name]` + hash + `.js`,
    //       assetFileNames: `[name]` + hash + `.[ext]`
    //     }
    //   }
    // }
  },
  css: [
    'primevue/resources/themes/md-dark-indigo/theme.css',
    // 'primevue/resources/themes/lara-dark-green/theme.css',
    '~/assets/scss/index.scss', // ep import colors
    '~/assets/scss/bv-colors.scss', // bv import colors
  ],
  elementPlus: {
    // useSource: true,
    icon: false,
    importStyle: "scss",
    themes: ['dark'], // from docs: "import style css or sass(scss) with components, disable automatically import styles with false."
    defaultLocale: 'de',
  },

  primevue: {
    usePrimeVue: true,
    /* Options */
    // cssLayerOrder: 'reset,primevue',
    options: {
      ripple: false,
      // unstyled: true,
      // pt: Tailwind,
      pt: {
        // ...Tailwind,

        // datatable: {
        //   header: {class: 'bg-red-500'},
        //   paginator: {class: 'bg-blue-500'},
        //   thead: {class: 'bg-green-500'}, // hover
        //   tbody: {class: 'bg-purple-500'},
        //   footer: {class: 'bg-yellow-500'},
        //   headerCell: {class: 'bg-pink-500'},
        //   bodyCell: {class: 'bg-blue-500'},
        // },
        // paginator: {
        //   handle: { class: 'bg-yellow-500' }
        // }
    }
    },

    components: {
      prefix: 'P',
      include: ['ContextMenu', 'DataTable', 'Column', 'ColumnGroup', 'Row', 'Paginator', 'Dropdown', 'VirtualScroller'],
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
