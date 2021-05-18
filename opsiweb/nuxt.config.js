import path from 'path'
import fs from 'fs'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',
  // mode: 'spa',
  server: {
    // host: 'localhost', // default: localhost
    // port: 8888, // default: 3000
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'https/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'https/server.crt'))
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

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/axios'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build'
  ],
  router: {
    middleware: ['authenticated'],
    base: '/webgui/app/'
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    [
      'nuxt-mq',
      {
        breakpoints: {
          mobile: 850,
          desktop: Infinity
        }
      }
    ]
  ],
  bootstrapVue: {
    // Install the `IconsPlugin` plugin (in addition to `BootstrapVue` plugin)
    icons: true
  },
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // baseURL: process.env.API_URL,
    // baseURL: process.env.API_URL,
    https: true,
    port: 4447,
    prefix: '/webgui',
    progress: false
    // // |--> default is 'true', but otherwise it is not a "simple request"
    // // and causes a CORS preflight error on firefox and safari-based browser
    // // alternative would be using proxy, but is not supported in static applications

    // withCredentials: true, // is set through '~/plugins/axios.js'
    // //    see: https://github.com/nuxt-community/axios-module/issues/168
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // publicPath: '/webgui/app/'
  }
}
