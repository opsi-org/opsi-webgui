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
    { clientId: 'client1.domain.local', ident: 'client1.domain.local', macAddress: 'af:fe:af:fe:af:f1', description: '', notes: '', version_outdated: 0, installationStatus_unknown: 0, installationStatus_installed: 0, actionResult_failed: 0, actionResult_successful: 0, selected: 0 },
    { clientId: 'client2.domain.local', ident: 'client2.domain.local', macAddress: 'af:fe:af:fe:af:f2', description: '', notes: '', version_outdated: 2, installationStatus_unknown: 2, installationStatus_installed: 2, actionResult_failed: 2, actionResult_successful: 2, selected: 0 },
    { clientId: 'client3.domain.local', ident: 'client3.domain.local', macAddress: 'af:fe:af:fe:af:f3', description: '', notes: '', version_outdated: 3, installationStatus_unknown: 3, installationStatus_installed: 3, actionResult_failed: 3, actionResult_successful: 3, selected: 0 },
    { clientId: 'client4.domain.local', ident: 'client4.domain.local', macAddress: 'af:fe:af:fe:af:f4', description: '', notes: '', version_outdated: 4, installationStatus_unknown: 4, installationStatus_installed: 4, actionResult_failed: 4, actionResult_successful: 4, selected: 0 },
    { clientId: 'client5.domain.local', ident: 'client5.domain.local', macAddress: 'af:fe:af:fe:af:f5', description: '', notes: '', version_outdated: 5, installationStatus_unknown: 5, installationStatus_installed: 5, actionResult_failed: 5, actionResult_successful: 5, selected: 0 }
  ],
  depots: [
    { depotId: '<config-server-id>', ident: '<config-server-id>', type: 'Configserver', ip: '', description: '' },
    { depotId: 'depot1.domain.local', ident: 'depot1.domain.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot2.domain.local', ident: 'depot2.domain.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot3.domain.local', ident: 'depot3.domain.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot4.domain.local', ident: 'depot4.domain.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot5.domain.local', ident: 'depot5.domain.local', type: 'Depotserver', ip: '', description: '' },
    { depotId: 'depot6.domain.local', ident: 'depot6.domain.local', type: 'Depotserver', ip: '', description: '' }
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

  netbootproductIds: ['netbootproduct1', 'netbootproduct2', 'netbootproduct3', 'netbootproduct4'],

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
    rowactions: { key: 'rowactions', label: 'actions', visible: false, _fixed: false }
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
      result: [
        "[1] [2022-05-24 12:54:10.925] [] -- ",
        "[1] [2022-05-24 12:54:10.925] [] -- ",
        "[1] [2022-05-24 12:54:10.925] [] script 1.12.5.0 started at >>",
        "[7] [2022-05-24 12:56:58.877] [productId] Starting with script... ",
        "[3] [2022-05-24 12:58:08.162] [productId] Error: 1 not fully installed or removed.",
        "[3] [2022-05-24 12:58:08.162] [productId] Error: After this operation, 0 B of additional disk space will be used.",
        "[3] [2022-05-24 12:58:08.167] [productId] Error: failed to install dependent packages",
        "[5] [2022-05-24 12:58:08.168] [productId] message failed to install dependent packages",
        "[2] [2022-05-24 12:58:08.173] [productId] Error level set to fatal",
        "[6] [2022-05-24 12:58:08.173] [productId] Process aborted ",
        "[1] [2022-05-24 12:58:08.174] [productId] ___________________",
        "[1] [2022-05-24 12:58:08.174] [productId] script finished: failed",
        "[1] [2022-05-24 12:58:08.175] [productId] 46 errors",
        "[1] [2022-05-24 12:58:08.175] [productId] 0 warnings",
        "[1] [2022-05-24 12:58:08.175] [productId]",
        "[1] [2022-05-24 12:58:08.175] [productId] handled product: productId Version: 1.1.0.23-1",
        "[1] [2022-05-24 12:58:08.175] [productId]",
        "[5] [2022-05-24 12:58:08.175] [productId] We do not look for a update script, because the setup script is failed",
        "[5] [2022-05-24 12:58:08.412] [] -------- submitted part of log file ends here, see the rest of log file on client ---------- "
      ]
    }
  },
  config:{
    client:[{"hostId":"client1.domain.local","type":"OpsiClient","description":"A test client","notes":"Ubuntu 20.04","hardwareAddress":"af:fe:af:fe:af:fe","ipAddress":"192.0.2.1","inventoryNumber":"","created":"2021-01-10T14:59:44","lastSeen":"2022-04-21T13:24:26","opsiHostKey":"abcdef","oneTimePassword":null,"uefi":false}]
  },
  modules: {"result":["directory-connector","dynamic_depot","install_by_shutdown","license_management","linux_agent","local_imaging","macos_agent","monitoring","mysql_backend","roaming_profiles","scalability1","secureboot","swondemand","treeview","uefi","userroles","vista","wim-capture","win-vhd","vpn","os_install_by_wlan"]},
  diagnostic:  { "system": {
          "product_name": "10SF002EGE",
          "docker": true
      },
      "health_check" :[
        {
            "partial_results": [
                {
                    "check_description": "",
                    "check_id": "opsiconfd_config:debug-options",
                    "check_name": "Config debug-options",
                    "check_status": "ok",
                    "details": {
                        "config": "debug-options",
                        "value": []
                    },
                    "message": "No debug options are set.",
                    "upgrade_issue": null
                },
                {
                    "check_description": "",
                    "check_id": "opsiconfd_config:run-as-user",
                    "check_name": "Config run-as-user",
                    "check_status": "error",
                    "details": {
                        "config": "profiler",
                        "value": "root"
                    },
                    "message": "Opsiconfd is runnning as user root.",
                    "upgrade_issue": null
                }
            ],
            "check_description": "Check opsiconfd configuration",
            "check_id": "opsiconfd_config",
            "check_name": "Opsiconfd config",
            "check_status": "error",
            "details": {},
            "message": "1 issues found in the configuration.",
            "upgrade_issue": null
        }]
    }
}