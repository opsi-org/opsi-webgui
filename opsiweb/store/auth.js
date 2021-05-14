import Cookie from 'js-cookie'

export const state = () => ({
  username: localStorage.getItem('username')
})

export const getters = {
  username: state => state.username,
  // isAuthenticated: () => Boolean(Cookie.get('opsiconfd-session'))
  // isAuthenticated: state => Boolean(Cookie.get('opsiconfd-session') && state.username)
  isAuthenticated: () => Boolean(Cookie.get('opsiconfd-session') && localStorage.getItem('username'))
  // isAuthenticated: () => {
  //   // const r = Boolean(Cookie.get('opsiconfd-session'))
  //   const r = Boolean(Cookie.get('opsiconfd-session') && localStorage.getItem('username'))
  //   // const r = Boolean(Cookie.get('opsiconfd-session') && state.username)
  //   // console.log('cookie set', Boolean(Cookie.get('opsiconfd-session')))
  //   // console.log('username', state.username)
  //   console.log('username localstorage', localStorage.getItem('username'))
  //   return r
  // }
}

export const mutations = {
  login (state, payload) {
    state.username = payload
    localStorage.setItem('username', payload)
    // console.log('cookie set')
  },
  logout (state) {
    localStorage.removeItem('username')
    state.username = undefined
    // Cookie.remove('opsiconf-session')
    // console.log('cookie removed')
  }
}

export const actions = {
}
