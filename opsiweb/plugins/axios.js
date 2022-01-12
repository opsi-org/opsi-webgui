export default function ({ $axios, redirect, store, route }) {
  if (process.client || process.static) {
    const host = window.location.hostname
    $axios.setBaseURL('https://' + host + ':4447/addons/webgui')
  }

  $axios.onRequest((config) => {
    $axios.setHeader('X-opsi-session-lifetime', 60 * 20)
    store.commit('auth/setSession', 60 * 20)
    // console.debug('Making request to ', config)
    if (config.url !== '/api/user/opsiserver') {
      config.withCredentials = true
    }
    return config
  })
  $axios.onResponse((/* response */) => {
    // console.debug('Received response from ', response)
  })

  $axios.onError((error) => {
    const code = parseInt(error.response && error.response.status)
    // if (code === 400) {
    //   // redirect('/400')
    // }
    // else
    if (code === 401) {
      store.commit('auth/logout')
      if (route.name !== 'login') {
        redirect('/login')
      }
    }
  })
}

// firefox cors OPTIONS problem:
// https://dev.to/jeremywynn/a-crazy-adventure-with-cors-nuxt-and-webmentions-5fhl
