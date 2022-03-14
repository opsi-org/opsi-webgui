import path from 'path'
import fs from 'fs'

import delib from 'uib-components/locale/de.json'
import enlib from 'uib-components/locale/en.json'
import enui from './locale/en.json'
import deui from './locale/de.json'

import pkg from './package-dry.json'

const de = { ...delib, ...deui } // merge language files from components and local one
const en = { ...enlib, ...enui } // have to be nested to avoid overwriting sections

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  // https://nuxtjs.org/guide/runtime-config
  publicRuntimeConfig: {
    packageVersion: pkg.version
  },
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',
  // mode: 'spa',
  server: {
    // host: 'localhost', // default: localhost
    // port: 8888, // default: 3000
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.config/https/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '.config/https/server.crt'))
    }
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'opsiweb',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  ignoreOptions: [],
  // Global CSS: https://go.nuxtjs.dev/config-css

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/axios',
    { src: '~/plugins/vuex-persist', ssr: false },
    { src: '~/uib-components/plugins/vue-treeselect.js', mode: 'client' }
    // '~/plugins/vue-i18n.js'
  ],

  css: ['uib-components/assets/css/custom'],
  dir: {
    layouts: 'uib-components/layouts',
    store: 'uib-components/store',
    assets: 'uib-components/assets',
    static: 'uib-components/static'
    // components: 'uib-components/layouts/',
    // layouts: path.resolve(process.cwd(), '../uib-components/layouts/'),
    // store: '.tmpstore'
    // store: '~/../uib-components/store/'
  },
  // Auto import components: https://go.nuxtjs.dev/config-components
  // components: true,
  components: ['uib-components/components/', 'components/'],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build'
    // '~/../uib-components/index.js'
    // 'uib-components/.nuxt-integration'
  ],

  router: {
    middleware: ['authenticated'],
    base: '/addons/webgui/app/'
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    ['@nuxtjs/i18n', {
      locale: 'en',
      vueI18n: {
        fallbackLocale: 'en',
        messages: { en, de }
      }
    }],
    ['nuxt-mq', {
      // Default breakpoint for SSR
      // defaultBreakpoint: 'mobile',
      breakpoints: {
        // mobile: 850, // should also be updated in Bar/BTop.vue on change!
        mobile: 767.98, // then compatible with bootstrap breakpoint 'md'
        // tablet: 1000,
        desktop: Infinity
      }
    }]
  ],
  bootstrapVue: {
    // Install the `IconsPlugin` plugin (in addition to `BootstrapVue` plugin)
    icons: true
  },
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // browserBaseURL: "/",
    // baseURL: process.env.API_URL,
    // baseURL: process.env.BASE_URL,
    https: true,
    port: 4447,
    prefix: '/addons/webgui',
    progress: false
    // progress: true,
    // baseURL: '/'
    // host: '/',
    // headers: {
    //   common: {
    //     // 'Accept': 'application/json, text/plain, */*',
    //     'Cache-Control': 'no-cache'
    //   },
    // }
    // // |--> default is 'true', but otherwise it is not a "simple request"
    // // and causes a CORS preflight error on firefox and safari-based browser
    // // alternative would be using proxy, but is not supported in static applications

    // withCredentials: true, // is set through '~/plugins/axios.js'
    // //    see: https://github.com/nuxt-community/axios-module/issues/168
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // publicPath: '/webgui/app/'
    // extend (config, ctx) {
    //   if (ctx.isDev) {
    //     config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
    //   }
    // }
  },
  storybook: {
    staticDirs: ['uib-components/assets'],
    stories: ['~/**/*.stories.js'],
    decorators: ['<div><link rel=\\"stylesheet\\" href=\\"/themes/opsi-bootstrap-theme-light.css\\"/><story/></div>']
    // addons: ['storybook-addon-mock/register']//, '@storybook/preset-typescript'] //, '@storybook/addon-mock']
  }
}
