import Cookie from 'js-cookie'

export const state = () => ({
  username: null,
  // expired: ""
})

export const getters = {
    username: (state) => state.username,
    // expired: (state) => state.expired,
    // isAuthenticated: (state) => !!state.username,
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

  // async isAuthenticated({state}, {$axios}) {
  //   console.debug("Auth/LogIn do axios");
  //   try {
  //     var response = await $axios.$post("/auth/authenticated");
  //     state.authenticated = response.result
  //   } catch (error) {
  //     state.authenticated = false
  //   }
  // },
};
