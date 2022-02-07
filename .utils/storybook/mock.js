// /**
//  * @module mockmodule for storybook
//  */

// imports
const Store = require('vuex').Store
const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')

//////////////////
// mocking axios
const mock = new MockAdapter(axios, { onNoMatch: 'throwException' })

// mocking store /modules
const auth = (durationMin=2) => {
  return {
    namespaced: true,
    getters: {
      sessionEndTime () { return new Date(new Date().getTime() + (60 * durationMin * 1000)) }, // 2 min in ms
      isAuthenticated () { return true },
    },
    mutation: {
      logout () { },
      clearSession () { }
    }
  }
}
mystore = ({ enable_auth=true, auth_durationMin=2 } = {}) => new Store({
  modules: {
    auth: (enable_auth)? auth(auth_durationMin): {}
  }
})

//////////////////
// exports
module.exports.mock = mock
module.exports.store = mystore
