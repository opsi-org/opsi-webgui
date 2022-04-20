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
  modules: { auth: (enable_auth)? auth(auth_durationMin): {} }
})
mystore = (module, getters = {foo () {}}, mutation = {}) => new Store({
  modules: { [module]: {
    namespaced: true,
    getters: getters,
    mutation: mutation,
  } }
})

//////////////////
// exports
module.exports.store = mystore
module.exports.customstore = mystore
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
  depots: [
    { depotId: 'depot1.uib.local', ident: 'depot1.uib.local', type: 'Configserver', ip: '', description: '' },
    { depotId: 'depot2.uib.local', ident: 'depot2.uib.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot3.uib.local', ident: 'depot3.uib.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot4.uib.local', ident: 'depot4.uib.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot5.uib.local', ident: 'depot5.uib.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot6.uib.local', ident: 'depot6.uib.local', type: 'Depotserver', ip: '', description: '' }
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
    },
    hosts: {"groups":{"groups":{"id":"groups;None","type":"HostGroup","text":"groups","parent":null,"allowed":true,"children":null},"clientdirectory":{"id":"clientdirectory;None","type":"HostGroup","text":"clientdirectory","parent":null,"allowed":true,"children":null},"clientlist":{"id":"clientlist;None","type":"HostGroup","text":"clientlist","parent":null,"hasAnySelection":false,"allowed":true,"children":null}}},
  },

  products: [
    { productId: 'product1', name:'product1 name', description: 'product1 Description',selectedDepots: ['depot1.uib.local'], selectedClients:null,installationStatus:'not_installed',actionRequest:'none', actionProgress:null, actionResult:null, clientVersions:['1.0-3'],client_version_outdated: false, actions:['setup','none'], depot_version_diff: false,depotVersions: ['1.0-3'], productType:'LocalbootProduct', selected:0 },
    { productId:'product2',name:'product2 name', description:'product2 Description',selectedDepots:['depot1.uib.local'], selectedClients:null, installationStatus:'installed',actionRequest:'none', actionProgress:null, actionResult:'successful', clientVersions:['2.0-3'],client_version_outdated: true, actions:['setup','none'], depot_version_diff: false,depotVersions: ['2.0-6'], productType:'LocalbootProduct', selected:0 },
    { productId:'product3', name:'product3 name',description:'product3 Description',selectedDepots:['depot1.uib.local'], selectedClients:null, installationStatus:'unknown',actionRequest:'setup', actionProgress:null, actionResult:'failed', clientVersions:null ,client_version_outdated: false, actions:['setup','none'], depot_version_diff: false,depotVersions: ['3.0-6'], productType:'LocalbootProduct', selected:0 },
  ],

  tableInfo: {
    filterQuery: '',
    sortBy: 'a',
    sortDesc: false,
    headerData: {
      sel: { label: 'sel', key: 'sel', visible: true, sortable: true, _fixed: true },
      a: { label: 'A', key: 'a', visible: true, sortable: true },
      b: { label: 'B', key: 'b', visible: false, sortable: true },
      c: { key: 'c', label: 'C', visible: false, sortable: true, _fixed: false },
      _M: { label: 'M', key: '_M', _isMajor: true, visible: false },
      m1: { label: 'm1', key: 'm1', _majorKey: '_M', visible: true, sortable: true },
      m2: { label: 'm2', key: 'm2', _majorKey: '_M', visible: true, sortable: true },
      z: { key: 'z', label: 'Z', visible: true, _fixed: true }
    }
  },
  headerData: {
    selected: { label: 'selected', key: 'selected', visible: true, sortable: true, _fixed: true },
    ident: { label: 'ident', key: 'ident', visible: true, sortable: false, _fixed: true },
    depotId: { label: 'depotId', key: 'depotId', visible: true, sortable: true, _fixed: true },
    rowactions: { key: 'rowactions', label: 'actions', visible: true, _fixed: true }
  },
  tableData: {
    pageNumber: 1,
    perPage: 2,
    sortBy: 'depotId',
    sortDesc: false,
    filterQuery: ''
  }
}
