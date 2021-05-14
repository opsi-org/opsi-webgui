import Cookie from 'js-cookie'

export const state = () => ({
  // colortheme:{title: "opsi-dark", rel:"~/assets/themes/theme-opsi-color-dark.css"},
  colortheme: { title: 'Bootswatch-Sketchy', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/sketchy/bootstrap.min.css' }
})

export const getters = {
  colortheme: (state) => {
    if (Cookie.get('theme')) {
      const c = JSON.parse(Cookie.get('theme'))
      if (c.rel !== state.colortheme.rel) {
        if (!state.colortheme.timestamp) {
          return c
        }
        return (new Date(new Date(c.timestamp)) - state.colortheme.timestamp < 0) ? c : state.colortheme
      }
    }
    return state.colortheme
  }
}

export const mutations = {
  setColorTheme (state, payload) {
    state.colortheme = payload
    state.colortheme.timestamp = new Date(new Date().toLocaleString(['en-EN'], { timeZone: 'Europe/Berlin' })).getTime()
    Cookie.set('theme', JSON.stringify(payload))
  }
}

export const actions = {
}
