import Cookie from 'js-cookie'

export const state = () => ({
  username: null,
})

export const getters = {
  username: (state) => state.username,
  isAuthenticated: (state) => Boolean(Cookie.get('opsiconfd-session') && state.username),
};

export const mutations = {
  setUsername(state, payload) {
    state.username = payload
  },
};

export const actions = {
};
