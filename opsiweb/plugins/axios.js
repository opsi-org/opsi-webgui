export default function ({ $axios, redirect, store }) {
  $axios.onRequest(config => {
    if (config.url !== '/api/user/opsiserver'){
      config.withCredentials = true
    }
    // console.debug('Making request to ', config)
    return config
  })
  $axios.onResponse((response) => {
      // console.debug('Received response from ', response)
    });

  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status)
    // console.error("ERROR code:", code)
    // if (code === 400) {
    //   // redirect('/400')
    // }
    // else
    if (code === 401) {
      // console.error("401: unauthorized")
      // store.commit('auth/setUsername', undefined)
      // redirect('/login')
    }
  })
}


// firefox cors OPTIONS problem:
// https://dev.to/jeremywynn/a-crazy-adventure-with-cors-nuxt-and-webmentions-5fhl