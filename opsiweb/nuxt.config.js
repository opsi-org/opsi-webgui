import path from 'path'
import fs from 'fs'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',
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

  // router:{
  //   middleware:['auth']
  // },
  // auth: {
  //   strategies: {
  //     // opsiconfd: { scheme: '~/schemes/opsiconfd', /* ... */ },
  //     // github: { /* ... */ },
  //   }
  // },
  // auth: {
  //   strategies: {
  //     cookie: {
  //       cookie: {
  //         // (optional) If set we check this cookie exsistence for loggedIn check
  //         name: 'XSRF-TOKEN',
  //         // name: 'opsiconfd-session',
  //       },
  //       endpoints: {
  //         endpoints: {
  //           login: { url: '/api/auth/login', method: 'post' },
  //           logout: { url: '/api/auth/logout', method: 'post' },
  //           // user: { url: '/api/auth/user', method: 'get' }
  //         }
  //         // (optional) If set, we send a get request to this endpoint before login
  //         // csrf: {
  //         //   url: ''
  //         // }
  //       }
  //     },
  //   }
  // },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // '@nuxtjs/auth-next',
    // '@nuxtjs/auth-next',
    // '@nuxtjs/proxy',
  ],
  // auth: {
  //   localStorage:false,
  //   // cookie: true,
  //   // cookie: { // v5 (auth-next)
  //   //     // (optional) If set we check this cookie exsistence for loggedIn check
  //   //   prefix: 'opsiconfd-session.',
  //   //   // name: 'opsiconfd-session',
  //   //   // name: 'set-cookie',
  //   //   name: 'X-SRFTOKEN',
  //   // },

  //   strategies: {
  //     local: false,
  //     cookie: {
  //       cookie: {
  //         prefix: 'opsiconfd-session',
  //         name: 'X-SRFTOKEN',
  //         // options: {
  //         //   path: '/'
  //         // }
  //       },
  //       token: {required: false, type: false},
  //       // token: {property: 'access_token', required: true, type: 'Bearer'},
  //       // tokenRequired: false,
  //       // tokenType: false,
  //       endpoints: {
  //         login: {
  //           url: '/api/auth/login',
  //           method: 'post',
  //           propertyName: false,
  //           // withCredentials: true,
  //         },
  //         logout: {
  //           url: '/api/auth/logout',
  //           method: 'post'
  //         },
  //         user: false
  //         // {
  //         //   url: '/api/auth/profile',
  //         //   // withCredentials: true,
  //         //   // url: '/api/user/opsiserver',
  //         //   method: 'get',
  //         //   propertyName: 'user'
  //         // }
  //       },
  //     }
  //   }
  // },
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // baseURL: process.env.API_URL,
    baseURL:"https://localhost:4447/webgui",
    // credentials: true,
    withCredentials: true,
    // maxRedirects: 0,
    // validateStatus: function (status) {
    //   return status <= 302; // Reject only if the status code is greater than 302
    // },
    // credentials: true,
    // init(axios) {
    //   axios.defaults.withCredentials = true
    // }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
