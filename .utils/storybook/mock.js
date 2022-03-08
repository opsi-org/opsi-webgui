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
module.exports.store = mystore
module.exports.mock = mock
module.exports.data = {
  depotIds: ['depot1.uib.local', 'depot2.uib.local', 'depot3.uib.local'],
  clientIds: ['client1.uib.local', 'client2.uib.local', 'client3.uib.local', 'client4.uib.local', 'client5.uib.local'],
  clients: [
    { clientId: 'client1.uib.local', ident: 'client1.uib.local', macAddress: 'af:fe:af:fe:af:f1', description: '', notes: '', version_outdated: 0, installationStatus_unknown: 0, installationStatus_installed: 0, actionResult_failed: 0, actionResult_successful: 0, selected: 0 },
    { clientId: 'client2.uib.local', ident: 'client2.uib.local', macAddress: 'af:fe:af:fe:af:f2', description: '', notes: '', version_outdated: 2, installationStatus_unknown: 2, installationStatus_installed: 2, actionResult_failed: 2, actionResult_successful: 2, selected: 0 },
    { clientId: 'client3.uib.local', ident: 'client3.uib.local', macAddress: 'af:fe:af:fe:af:f3', description: '', notes: '', version_outdated: 3, installationStatus_unknown: 3, installationStatus_installed: 3, actionResult_failed: 3, actionResult_successful: 3, selected: 0 },
    { clientId: 'client4.uib.local', ident: 'client4.uib.local', macAddress: 'af:fe:af:fe:af:f4', description: '', notes: '', version_outdated: 4, installationStatus_unknown: 4, installationStatus_installed: 4, actionResult_failed: 4, actionResult_successful: 4, selected: 0 },
    { clientId: 'client5.uib.local', ident: 'client5.uib.local', macAddress: 'af:fe:af:fe:af:f5', description: '', notes: '', version_outdated: 5, installationStatus_unknown: 5, installationStatus_installed: 5, actionResult_failed: 5, actionResult_successful: 5, selected: 0 }
  ],
  groups:{
    products: {
      groups:{
        aha:{ id:'aha', type:'ProductGroup', text:'aha', parent:'root', children: {
          hwaudit:{ id:'hwaudit;aha', type:'ObjectToGroup', text:'hwaudit', parent:'aha'}
        }},
        audit:{ id:'audit', type:'ProductGroup', text:'audit', parent:'root', children: {
          hwaudit:{ id:'hwaudit;audit', type:'ObjectToGroup', text:'hwaudit', parent:'audit'},
          swaudit:{ id:'swaudit;audit', type:'ObjectToGroup', text:'swaudit', parent:'audit'}
        }}
      }
    }
  },

  products: [
    { productId: 'product1', name:'product1 name', description: 'product1 Description',selectedDepots: ['depot1.uib.local'], selectedClients:null,installationStatus:'not_installed',actionRequest:'none', actionProgress:null, actionResult:null, clientVersions:['1.0-3'],client_version_outdated: false, actions:['setup','none'], depot_version_diff: false,depotVersions: ['1.0-3'], productType:'LocalbootProduct', selected:0 },
    { productId:'product2',name:'product2 name', description:'product2 Description',selectedDepots:['depot1.uib.local'], selectedClients:null, installationStatus:'installed',actionRequest:'none', actionProgress:null, actionResult:'successful', clientVersions:['2.0-3'],client_version_outdated: true, actions:['setup','none'], depot_version_diff: false,depotVersions: ['2.0-6'], productType:'LocalbootProduct', selected:0 },
    { productId:'product3', name:'product3 name',description:'product3 Description',selectedDepots:['depot1.uib.local'], selectedClients:null, installationStatus:'unknown',actionRequest:'setup', actionProgress:null, actionResult:'failed', clientVersions:null ,client_version_outdated: false, actions:['setup','none'], depot_version_diff: false,depotVersions: ['3.0-6'], productType:'LocalbootProduct', selected:0 },
  ]
}
