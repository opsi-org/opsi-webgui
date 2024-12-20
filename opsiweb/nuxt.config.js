/* eslint-disable import/order */
import path from 'path'
import fs from 'fs'
import pkg from './package.json'

const CONFD_PORT = process.env.OPSICONFD_PORT || 4447
const ADDON_PATH = '/addons/webgui'

const langs = {}

const dir = './uib-components/locale/'
const fullPath = path.join(__dirname, dir)
const files = fs.readdirSync(fullPath)
console.log('DEBUG: Reading locales')
try {
  // gets all internationalization files, which are located in 'dir'
  files.forEach((file) => {
    if (/opsi-webgui_(.*)\.json/.test(file)) {
      const l = file.match(/opsi-webgui_(.*)\.json/)
      try {
        const json = require(fullPath + '/' + file)
        langs[l[1]] = json
      } catch (error) { console.log('Error reading file ', file, error) }
    }
  })
} catch (error) { console.log(error) }
console.log('===================================================================')
console.log('DEBUG: Nuxt config')
console.log('DEBUG: OPSICONFD_PORT: ', CONFD_PORT)
console.log('DEBUG: PKG version: ', pkg.version)
console.log('DEBUG: Reading locales done: ', Object.keys(langs))
console.log('===================================================================')

const env = {
  APIPATH: ADDON_PATH
}
export default {
  srcDir: '.',
  env: {
    APIPATH: ADDON_PATH
  },
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
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
    title: 'opsi-webgui',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    noscript: [{ innerHTML: 'opsi-webgui requires JavaScript. Please enable it in your browser.' }],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: 'favicon-biene.ico' }
      // { rel: 'icon', type: 'image/x-icon', href: 'favicon-webgui.ico' }
    ]
  },
  ignoreOptions: [],
  // Global CSS: https://go.nuxtjs.dev/config-css

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // '~/plugins/axios',
    { src: '~/uib-components/plugins/axios' },
    { src: '~/uib-components/plugins/vuex-persist', ssr: false },
    { src: '~/uib-components/plugins/vue-treeselect.js', mode: 'client' },
    { src: '~/uib-components/plugins/vue-markdown.js' }
    // '~/plugins/vue-i18n.js'
  ],

  // css: ['uib-components/assets/css/custom'],
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
  components: ['~/uib-components/components/'], // { path: '~/uib-components/components/', extensions: ['vue'] },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build'
    // '~/../uib-components/index.js'
    // 'uib-components/.nuxt-integration'
  ],

  router: {
    middleware: ['authenticated'],
    base: ADDON_PATH + '/app/'
  },
  watchers: {
    webpack: {
      aggregateTimeout: 300,
      poll: 1000
    }
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
        messages: langs
      }
    }],
    ['nuxt-mq', {
      // Default breakpoint for SSR
      // defaultBreakpoint: 'mobile',
      breakpoints: {
        // mobile: 850, // should also be updated in Bar/BTop.vue on change!
        mobile: 767.98, // then compatible with bootstrap breakpoint 'md'
        tablet: 1000,
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
    baseURL: (process.env.NODE_ENV === 'production') ? env.APIPATH : 'http://localhost:' + CONFD_PORT + env.APIPATH, // fallback baseurl
    https: true,
    progress: false
  },
  // https://nuxtjs.org/guide/runtime-config
  publicRuntimeConfig: {
    packageVersion: pkg.version,
    confdPort: CONFD_PORT,
    webguipath: ADDON_PATH,
    OWN_PATH: ADDON_PATH + '/app'
  },
  privateRuntimeConfig: {
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // publicPath: '/webgui/app/'
    // extend (config, ctx) {
    //   if (ctx.isDev) {
    //     config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
    //   }
    // }
    babel: {
      compact: true
    }
  },
  storybook: {
    staticDirs: ['uib-components/assets', 'uib-components/static'],
    stories: ['~/**/*.stories.js'],
    // decorators: ['<div><link rel=\\"stylesheet\\" href=\\"/themes/opsi-bootstrap-theme-light.css\\"/><story/></div>']
    decorators: ['<div id=\\"hallo\\"><link rel=\\"stylesheet\\" href=\\"/themes/storybook-import.css\\"/><story/></div>'
    ]
  }
}
