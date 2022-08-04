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
customstore = (module, getters = {foo () {}}, mutation = {}) => new Store({
  modules: { [module]: {
    namespaced: true,
    getters: getters,
    mutation: mutation,
  } }
})
customstores = (modules = {}) => new Store({
  modules: modules
})

//////////////////
// exports
module.exports.store = mystore
module.exports.customstore = customstore
module.exports.customstores = customstores
module.exports.mock = mock
module.exports.data = {
  depotIds: ['<config-server-id>', 'depot1.uib.local', 'depot2.uib.local', 'depot3.uib.local'],
  clientIds: ['client1.uib.local', 'client2.uib.local', 'client3.uib.local', 'client4.uib.local', 'client5.uib.local'],
  clients: [
    { clientId: 'client1.uib.local', ident: 'client1.uib.local', macAddress: 'af:fe:af:fe:af:f1', description: '', notes: '', version_outdated: 0, installationStatus_unknown: 0, installationStatus_installed: 0, actionResult_failed: 0, actionResult_successful: 0, selected: 0 },
    { clientId: 'client2.uib.local', ident: 'client2.uib.local', macAddress: 'af:fe:af:fe:af:f2', description: '', notes: '', version_outdated: 2, installationStatus_unknown: 2, installationStatus_installed: 2, actionResult_failed: 2, actionResult_successful: 2, selected: 0 },
    { clientId: 'client3.uib.local', ident: 'client3.uib.local', macAddress: 'af:fe:af:fe:af:f3', description: '', notes: '', version_outdated: 3, installationStatus_unknown: 3, installationStatus_installed: 3, actionResult_failed: 3, actionResult_successful: 3, selected: 0 },
    { clientId: 'client4.uib.local', ident: 'client4.uib.local', macAddress: 'af:fe:af:fe:af:f4', description: '', notes: '', version_outdated: 4, installationStatus_unknown: 4, installationStatus_installed: 4, actionResult_failed: 4, actionResult_successful: 4, selected: 0 },
    { clientId: 'client5.uib.local', ident: 'client5.uib.local', macAddress: 'af:fe:af:fe:af:f5', description: '', notes: '', version_outdated: 5, installationStatus_unknown: 5, installationStatus_installed: 5, actionResult_failed: 5, actionResult_successful: 5, selected: 0 }
  ],
  depots: [
    { depotId: '<config-server-id>', ident: '<config-server-id>', type: 'Configserver', ip: '', description: '' },
    { depotId: 'depot1.uib.local', ident: 'depot1.uib.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot2.uib.local', ident: 'depot2.uib.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot3.uib.local', ident: 'depot3.uib.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot4.uib.local', ident: 'depot4.uib.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot5.uib.local', ident: 'depot5.uib.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot6.uib.local', ident: 'depot6.uib.local', type: 'Depotserver', ip: '', description: '' }
  ],
  groups:{
    products: {
      groups:{
        group1:{ id:'group1', type:'ProductGroup', text:'group1', parent:'root', children: {
          product1:{ id:'product1;group1', type:'ObjectToGroup', text:'product1', parent:'group1'}
        }},
        group2:{ id:'group2', type:'ProductGroup', text:'group2', parent:'root', children: {
          product1:{ id:'product1;group2', type:'ObjectToGroup', text:'product1', parent:'group2'},
          product2:{ id:'product2;group2', type:'ObjectToGroup', text:'product2', parent:'group2'}
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
  headerDataProducts: {
    selected: { label: 'selected', key: 'selected', visible: true, sortable: true, _fixed: true },
    ident: { label: 'ident', key: 'ident', visible: false, sortable: false, _fixed: false },
    productId: { label: 'productId', key: 'productId', visible: true, sortable: true, _fixed: true },
    name: { label: 'name', key: 'name', visible: false, sortable: true, _fixed: false },
    actionRequest: { label: 'actionRequest', key: 'actionRequest', visible: false, sortable: true, _fixed: false },
    // actionProgress: { label: 'actionProgress', key: 'actionProgress', visible: true, sortable: true, _fixed: true },
    // installationStatus: { label: 'installationStatus', key: 'installationStatus', visible: true, sortable: true, _fixed: true },
    // version: { label: 'version', key: 'version', visible: true, sortable: true, _fixed: true },
    rowactions: { key: 'rowactions', label: 'actions', visible: true, _fixed: true }
  },
  tableData: {
    pageNumber: 1,
    perPage: 2,
    sortBy: 'depotId',
    sortDesc: false,
    filterQuery: ''
  },
  tableDataMoreElements: {
    pageNumber: 1,
    perPage: 3,
    sortBy: '',
    sortDesc: false,
    filterQuery: ''
  },
  logs:{
    clients: {
      result: ["",
        "[0] [2021-08-23 13:28:07.151] [] ",
        "[1] [2021-08-23 13:28:07.151] [] --",
        "[2] [2021-08-23 13:28:07.151] [productId] next row",
        "[3] [2021-08-23 13:28:07.151] [productId] next row",
        "[4] [2021-08-23 13:28:07.151] [productId] next row",
        "[6] [2021-08-23 13:28:07.151] [productId] next row",
        "[7] [2021-08-23 13:28:07.151] [productId] next row",
        "[8] [2021-08-23 13:28:07.151] [productId] next row",
        "[9] [2021-08-23 13:28:07.151] [productId] next row",
      ]}
  },
  config:{
    client:[{"hostId":"client1.uib.local","type":"OpsiClient","description":"a client description","notes":"Ubuntu 20.04","hardwareAddress":"af:fe:af:fe:af:fe","ipAddress":"1.2.3.4","inventoryNumber":"","created":"2021-01-10T14:59:44","lastSeen":"2022-04-21T13:24:26","opsiHostKey":"abcdef","oneTimePassword":null,"uefi":false}]
  },
  modules: {"result":["directory-connector","dynamic_depot","install_by_shutdown","license_management","linux_agent","local_imaging","macos_agent","monitoring","mysql_backend","roaming_profiles","scalability1","secureboot","swondemand","treeview","uefi","userroles","vista","wim-capture","win-vhd","vpn","os_install_by_wlan"]}
}
