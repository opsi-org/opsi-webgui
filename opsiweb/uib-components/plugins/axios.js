export default function ({ $axios, redirect, store, route }) {
  if (process.client || process.static) {
    const host = window.location.hostname
    const port = (process.env.NODE_ENV === 'production') ? window.location.port : 4447
    $axios.setBaseURL('https://' + host + ':' + port + '/addons/webgui')
  }

  $axios.onRequest((config) => {
    if (config.url !== '/api/user/opsiserver') {
      config.withCredentials = true
    }
    if (config.url !== '/api/auth/logout' || config.url !== '/api/user/configuration') {
      const expiry = store.getters['auth/sessionExpiry']
      $axios.setHeader('X-opsi-session-lifetime', expiry)
      store.commit('auth/setSession', expiry)
    }
    // eslint-disable-next-line no-console
    console.debug('axios request ', config.url)
    return config
  })
  $axios.onResponse((response) => {
    // eslint-disable-next-line no-console
    console.debug('axios response ', response.config.url)
  })

  $axios.onError((error) => {
    // eslint-disable-next-line no-console
    console.debug('axios error ', error?.response?.config.url)
    const code = parseInt(error?.response?.status)
    if (code === 401) {
      localStorage.removeItem('username')
      store.commit('auth/logout')
      if (route.name !== 'login') {
        redirect('/login')
      }
    }
  })
}

// firefox cors OPTIONS problem:
// https://dev.to/jeremywynn/a-crazy-adventure-with-cors-nuxt-and-webmentions-5fhl
