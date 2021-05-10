import Cookie from 'js-cookie'

export const state = () => ({
  username: null,
  // expired: ""
})

export const getters = {
    username: (state) => state.username,
    // expired: (state) => state.expired,
    // isAuthenticated: (state) => !!state.username,
    // isAuthenticated: (state) => Boolean(Cookie.get("opsiconfd-session")),
    isAuthenticated: (state) => {
      let r = Boolean(Cookie.get("opsiconfd-session") ) //&& state.username)
      console.debug("Cookie: ", Cookie.get("opsiconfd-session"))
      console.debug("username: ", state.username)
      return r
    },
};

export const mutations = {
    setUsername(state, payload) {
      state.username = payload
    },
    // setExpired(state, payload) {
    //   state.expired = new Date(new Date().toLocaleString(["en-EN"], { timeZone: "Europe/Berlin" })).getTime();
    // },
};

export const actions = {
};
