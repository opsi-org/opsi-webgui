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
      },
    },
    productgroups: {
      "groups": {
        "group1": {
          "id": "group1",
          "type": "ProductGroup",
          "text": "group1",
          "parent": "root",
          "children": {
            "hwaudit": {
              "id": "hwaudit;group1",
              "type": "ObjectToGroup",
              "text": "hwaudit",
              "parent": "group1"
            }
          }
        },
        "group2": {
          "id": "group2",
          "type": "ProductGroup",
          "text": "group2",
          "parent": "root",
          "children": {
            "hwaudit": {
              "id": "hwaudit;group2",
              "type": "ObjectToGroup",
              "text": "hwaudit",
              "parent": "group2"
            },
            "swaudit": {
              "id": "swaudit;group2",
              "type": "ObjectToGroup",
              "text": "swaudit",
              "parent": "group2"
            }
          }
        },
        "group3": {
          "id": "group3",
          "type": "ProductGroup",
          "text": "group3",
          "parent": "root",
          "children": {
            "firefox": {
              "id": "firefox;group3",
              "type": "ObjectToGroup",
              "text": "firefox",
              "parent": "group3"
            },
            "chrome": {
              "id": "chrome;group3",
              "type": "ObjectToGroup",
              "text": "chrome",
              "parent": "group3"
            },
            "edge": {
              "id": "edge;group3",
              "type": "ObjectToGroup",
              "text": "edge",
              "parent": "group3"
            }
          }
        }
      }
    },
    hosts: {"groups":{
      "groups":
        {"id":"groups;None","type":"HostGroup","text":"groups","parent":null,"allowed":true,"children":null},
      "clientdirectory":
        {"id":"clientdirectory;None","type":"HostGroup","text":"clientdirectory","parent":null,"allowed":true,"children":null},
      "clientlist":{"id":"clientlist;None","type":"HostGroup","text":"clientlist","parent":null,"hasAnySelection":false,"allowed":true,"children":null}
      }},


    hostgroups: {
      groups: { id: 'groups;None', type: 'HostGroup', text: 'groups', parent: null, children: [
        { id: 'groups;TestGroup1', type: 'HostGroup', text: 'TestGroup1', parent: 'groups', children: [], allowed: true },
        { id: 'groups;TestGroup2', type: 'HostGroup', text: 'TestGroup2', parent: 'groups', children: [], allowed: true },
        { id: 'groups;TestGroup3', type: 'HostGroup', text: 'TestGroup3', parent: 'groups', children: [], allowed: true },
      ], allowed: true },
      clientdirectory: { id: 'clientdirectory;None', type: 'HostGroup', text: 'clientdirectory', parent: null, children: [
        { id: 'clientdirectory;ClientDirGroup1', type: 'HostGroup', text: 'ClientDirGroup1', parent: 'clientdirectory', children: [], allowed: true },
        { id: 'clientdirectory;ClientDirGroup2', type: 'HostGroup', text: 'ClientDirGroup2', parent: 'clientdirectory', children: [], allowed: true },
        { id: 'clientdirectory;ClientDirGroup3', type: 'HostGroup', text: 'ClientDirGroup3', parent: 'clientdirectory', children: [], allowed: true }

      ], allowed: true },
      clientlist: { id: 'clientlist;None', type: 'HostGroup', text: 'clientlist', parent: null, children: null, hasAnySelection: true, allowed: true }
    },
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
  },
  health: [
    {"partial_results":[{"check_description":"","check_id":"opsi_config:opsiclientd.global.verify_server_cert","check_name":"OPSI Configuration opsiclientd.global.verify_server_cert","check_status":"ok","details":{"config_id":"opsiclientd.global.verify_server_cert","deafult_value":[true],"value":[true]},"message":"Configuration opsiclientd.global.verify_server_cert is set to default.","upgrade_issue":null}],"check_description":"Check opsi configuration state","check_id":"opsi_config","check_name":"OPSI Configuration","check_status":"ok","details":{},"message":"No issues found in the opsi configuration.","upgrade_issue":null},{"partial_results":[{"check_description":"","check_id":"opsiconfd_config:log-level-stderr","check_name":"Config log-level-stderr","check_status":"ok","details":{"config":"log-level-stderr","value":5},"message":"Log level setting 'log-level-stderr=NOTICE' is suitable for productive use.","upgrade_issue":null},{"check_description":"","check_id":"opsiconfd_config:log-level-file","check_name":"Config log-level-file","check_status":"ok","details":{"config":"log-level-file","value":4},"message":"Log level setting 'log-level-file=WARNING' is suitable for productive use.","upgrade_issue":null},{"check_description":"","check_id":"opsiconfd_config:log-level","check_name":"Config log-level","check_status":"ok","details":{"config":"log-level","value":5},"message":"Log level setting 'log-level=NOTICE' is suitable for productive use.","upgrade_issue":null},{"check_description":"","check_id":"opsiconfd_config:debug-options","check_name":"Config debug-options","check_status":"ok","details":{"config":"debug-options","value":[]},"message":"No debug options are set.","upgrade_issue":null},{"check_description":"","check_id":"opsiconfd_config:profiler","check_name":"Config profiler","check_status":"ok","details":{"config":"profiler","value":false},"message":"Profiler is not enabled.","upgrade_issue":null},{"check_description":"","check_id":"opsiconfd_config:run-as-user","check_name":"Config run-as-user","check_status":"ok","details":{"config":"profiler","value":"opsiconfd"},"message":"Opsiconfd is running as user opsiconfd.","upgrade_issue":null}],"check_description":"Check opsiconfd configuration","check_id":"opsiconfd_config","check_name":"Opsiconfd config","check_status":"ok","details":{},"message":"No issues found in the configuration.","upgrade_issue":null},{"partial_results":[],"check_description":"Check Redis server state","check_id":"redis","check_name":"Redis server","check_status":"ok","details":{"connection":true,"timeseries":false},"message":"Redis is running and RedisTimeSeries is loaded.","upgrade_issue":null},{"partial_results":[],"check_description":"Check MySQL server state","check_id":"mysql","check_name":"MySQL server","check_status":"ok","details":{},"message":"Connection to MySQL is working.","upgrade_issue":null},{"partial_results":[{"check_description":"","check_id":"run_as_user:home_directory","check_name":"Home directory of user 'opsiconfd'","check_status":"ok","details":{"user":"opsiconfd","home_directory":"/var/lib/opsiconfd/home"},"message":"Home directory of user 'opsiconfd' is /var/lib/opsiconfd/home","upgrade_issue":null},{"check_description":"","check_id":"run_as_user:group_membership:shadow","check_name":"Group membership of user 'opsiconfd' in group 'shadow'","check_status":"ok","details":{"user":"opsiconfd","group":"shadow","primary":false},"message":"User 'opsiconfd' is a member of group 'shadow'","upgrade_issue":null},{"check_description":"","check_id":"run_as_user:group_membership:opsiadmin","check_name":"Group membership of user 'opsiconfd' in group 'opsiadmin'","check_status":"ok","details":{"user":"opsiconfd","group":"opsiadmin","primary":false},"message":"User 'opsiconfd' is a member of group 'opsiadmin'","upgrade_issue":null},{"check_description":"","check_id":"run_as_user:group_membership:opsifileadmins","check_name":"Group membership of user 'opsiconfd' in group 'opsifileadmins'","check_status":"ok","details":{"user":"opsiconfd","group":"opsifileadmins","primary":true},"message":"User 'opsiconfd' is a member of group 'opsifileadmins' (primary)","upgrade_issue":null}],"check_description":"Check system user running opsiconfd","check_id":"run_as_user","check_name":"Run as user","check_status":"ok","details":{},"message":"No issues found with user 'opsiconfd'.","upgrade_issue":null},{"partial_results":[{"check_description":"","check_id":"opsi_licenses:directory-connector","check_name":"OPSI license for module 'directory-connector'","check_status":"error","details":{"module_id":"directory-connector","state":"over_limit","client_number":0},"message":"License for module 'directory-connector' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:license_management","check_name":"OPSI license for module 'license_management'","check_status":"error","details":{"module_id":"license_management","state":"over_limit","client_number":0},"message":"License for module 'license_management' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:linux_agent","check_name":"OPSI license for module 'linux_agent'","check_status":"error","details":{"module_id":"linux_agent","state":"over_limit","client_number":0},"message":"License for module 'linux_agent' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:local_imaging","check_name":"OPSI license for module 'local_imaging'","check_status":"error","details":{"module_id":"local_imaging","state":"over_limit","client_number":0},"message":"License for module 'local_imaging' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:macos_agent","check_name":"OPSI license for module 'macos_agent'","check_status":"error","details":{"module_id":"macos_agent","state":"over_limit","client_number":0},"message":"License for module 'macos_agent' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:monitoring","check_name":"OPSI license for module 'monitoring'","check_status":"error","details":{"module_id":"monitoring","state":"over_limit","client_number":0},"message":"License for module 'monitoring' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:mysql_backend","check_name":"OPSI license for module 'mysql_backend'","check_status":"error","details":{"module_id":"mysql_backend","state":"over_limit","client_number":0},"message":"License for module 'mysql_backend' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:scalability1","check_name":"OPSI license for module 'scalability1'","check_status":"error","details":{"module_id":"scalability1","state":"over_limit","client_number":0},"message":"License for module 'scalability1' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:secureboot","check_name":"OPSI license for module 'secureboot'","check_status":"error","details":{"module_id":"secureboot","state":"over_limit","client_number":0},"message":"License for module 'secureboot' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:uefi","check_name":"OPSI license for module 'uefi'","check_status":"error","details":{"module_id":"uefi","state":"over_limit","client_number":0},"message":"License for module 'uefi' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:userroles","check_name":"OPSI license for module 'userroles'","check_status":"error","details":{"module_id":"userroles","state":"over_limit","client_number":0},"message":"License for module 'userroles' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:wim-capture","check_name":"OPSI license for module 'wim-capture'","check_status":"error","details":{"module_id":"wim-capture","state":"over_limit","client_number":0},"message":"License for module 'wim-capture' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:win-vhd","check_name":"OPSI license for module 'win-vhd'","check_status":"error","details":{"module_id":"win-vhd","state":"over_limit","client_number":0},"message":"License for module 'win-vhd' is over the limit of 0.","upgrade_issue":null},{"check_description":"","check_id":"opsi_licenses:vpn","check_name":"OPSI license for module 'vpn'","check_status":"error","details":{"module_id":"vpn","state":"over_limit","client_number":0},"message":"License for module 'vpn' is over the limit of 0.","upgrade_issue":null}],"check_description":"Check opsi licensing state","check_id":"opsi_licenses","check_name":"OPSI licenses","check_status":"error","details":{"client_numbers":{"macos":0,"linux":0,"windows":30,"inactive":104,"all":30}},"message":"30 active clients, licensing issues detected.","upgrade_issue":null},{"partial_results":[],"check_description":"\n\t\t\tCheck Operating System end-of-life date.\n\t\t\t'End-of-life' or EOL is a term used by software vendors indicating that it is ending or\n\t\t\tlimiting it's support on the product and/or version to shift focus on their newer products and/or version.\n\t\t","check_id":"linux_distro_eol","check_name":"Operating System End Of Life","check_status":"ok","details":{},"message":"Version 20.04 of distribution ubuntu is supported until 2025-04-01.","upgrade_issue":null},{"partial_results":[{"check_description":"","check_id":"system_packages:opsiconfd","check_name":"System package 'opsiconfd'","check_status":"ok","details":{"package":"opsiconfd","available_version":"4.2.0.310-1","version":"4.3.0.81-1","outdated":false},"message":"Package 'opsiconfd' is up to date. Installed version: '4.3.0.81-1'","upgrade_issue":null},{"check_description":"","check_id":"system_packages:opsi-utils","check_name":"System package 'opsi-utils'","check_status":"ok","details":{"package":"opsi-utils","available_version":"4.2.0.205-1","version":"4.3.0.43-1","outdated":false},"message":"Package 'opsi-utils' is up to date. Installed version: '4.3.0.43-1'","upgrade_issue":null},{"check_description":"","check_id":"system_packages:opsipxeconfd","check_name":"System package 'opsipxeconfd'","check_status":"ok","details":{"package":"opsipxeconfd","available_version":"4.2.0.32-1","version":"4.3.0.10-1","outdated":false},"message":"Package 'opsipxeconfd' is up to date. Installed version: '4.3.0.10-1'","upgrade_issue":null}],"check_description":"Check system package versions","check_id":"system_packages","check_name":"System packages","check_status":"ok","details":{"packages":3,"not_installed":0,"outdated":0},"message":"All packages are up to date.","upgrade_issue":null},{"partial_results":[],"check_description":"Check disk usage","check_id":"disk_usage","check_name":"Disk usage","check_status":"ok","details":{},"message":"Sufficient free space on all file systems.","upgrade_issue":null},{"partial_results":[{"check_description":"","check_id":"depotservers:ast14.uib.local:depot_path","check_name":"Depotserver depot_path on 'ast14.uib.local'","check_status":"ok","details":{"path":"/var/lib/opsi/depot"},"message":"The configured depot path corresponds to the default.","upgrade_issue":null},{"check_description":"","check_id":"depotservers:ast14.uib.local:repository_path","check_name":"Depotserver repository_path on 'ast14.uib.local'","check_status":"ok","details":{"path":"/var/lib/opsi/repository"},"message":"The configured repository path corresponds to the default.","upgrade_issue":null},{"check_description":"","check_id":"depotservers:ast14.uib.local:workbench_path","check_name":"Depotserver workbench_path on 'ast14.uib.local'","check_status":"ok","details":{"path":"/var/lib/opsi/workbench"},"message":"The configured workbench path corresponds to the default.","upgrade_issue":null},{"check_description":"","check_id":"depotservers:test-depot-1.uib.local:depot_path","check_name":"Depotserver depot_path on 'test-depot-1.uib.local'","check_status":"error","details":{"path":""},"message":"The local depot path is no longer configurable in version 4.3 and is set to '' on depot 'test-depot-1.uib.local'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"depotservers:test-depot-1.uib.local:repository_path","check_name":"Depotserver repository_path on 'test-depot-1.uib.local'","check_status":"error","details":{"path":""},"message":"The local repository path is no longer configurable in version 4.3 and is set to '' on depot 'test-depot-1.uib.local'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"depotservers:test-depot-1.uib.local:workbench_path","check_name":"Depotserver workbench_path on 'test-depot-1.uib.local'","check_status":"error","details":{"path":""},"message":"The local workbench path is no longer configurable in version 4.3 and is set to '' on depot 'test-depot-1.uib.local'.","upgrade_issue":"4.3"}],"check_description":"The opsi repository, workbench and depot must be located under /var/lib/opsi/.If this is not the case, an error will be reported.","check_id":"depotservers","check_name":"Depotserver check","check_status":"error","details":{},"message":"3 issues found with the depot servers.","upgrade_issue":"4.3"},{"partial_results":[{"check_description":"","check_id":"product_on_depots:ast14.uib.local:config-win10","check_name":"Product 'config-win10' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"config-win10","version":"4.1.1-9","available_version":"4.2.0-3"},"message":"Product 'config-win10' is outdated on depot 'ast14.uib.local'. Installed version '4.1.1-9' < available version '4.2.0-3'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:debian","check_name":"Product 'debian' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"debian","version":"4.1.0.3-1","available_version":"4.2.0.5-2"},"message":"Product 'debian' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.3-1' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:debian10","check_name":"Product 'debian10' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"debian10","version":"4.1.0.5-2","available_version":"4.2.0.1-15"},"message":"Product 'debian10' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.5-2' < available version '4.2.0.1-15'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:hwaudit","check_name":"Product 'hwaudit' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"hwaudit","version":"4.1.1.0-1","available_version":"4.2.0.3-1"},"message":"Product 'hwaudit' is outdated on depot 'ast14.uib.local'. Installed version '4.1.1.0-1' < available version '4.2.0.3-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:hwinvent","check_name":"Product 'hwinvent' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"hwinvent","version":"4.1.0.1-1","available_version":"4.1.0.1-3"},"message":"Product 'hwinvent' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.1-1' < available version '4.1.0.1-3'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:jedit","check_name":"Product 'jedit' on 'ast14.uib.local'","check_status":"ok","details":{"depot_id":"ast14.uib.local","product_id":"jedit","version":"5.5.0-6","available_version":"5.5.0-6"},"message":"Installed version of product 'jedit' on depot 'ast14.uib.local' is '5.5.0-6'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:l-debuntu-upgrade","check_name":"Product 'l-debuntu-upgrade' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"l-debuntu-upgrade","version":"4.1.0.0-6","available_version":"4.2.0.2-1"},"message":"Product 'l-debuntu-upgrade' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.0-6' < available version '4.2.0.2-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:l-desktop","check_name":"Product 'l-desktop' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"l-desktop","version":"4.1.0.5-5","available_version":"4.2.0.4-1"},"message":"Product 'l-desktop' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.5-5' < available version '4.2.0.4-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:l-opsi-server","check_name":"Product 'l-opsi-server' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"l-opsi-server","version":"4.1.1.14-3","available_version":"4.2.0.9-4"},"message":"Product 'l-opsi-server' is outdated on depot 'ast14.uib.local'. Installed version '4.1.1.14-3' < available version '4.2.0.9-4'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:l-opsi-server-migrate","check_name":"Product 'l-opsi-server-migrate' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"l-opsi-server-migrate","version":"4.1.2-2","available_version":"4.2.3-8"},"message":"Product 'l-opsi-server-migrate' is outdated on depot 'ast14.uib.local'. Installed version '4.1.2-2' < available version '4.2.3-8'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:l-opsi-server-register-depot","check_name":"Product 'l-opsi-server-register-depot' on 'ast14.uib.local'","check_status":"ok","details":{"depot_id":"ast14.uib.local","product_id":"l-opsi-server-register-depot","version":"4.1.0.2-2","available_version":"4.1.0.2-2"},"message":"Installed version of product 'l-opsi-server-register-depot' on depot 'ast14.uib.local' is '4.1.0.2-2'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:l-system-update","check_name":"Product 'l-system-update' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"l-system-update","version":"4.1.0.0-2","available_version":"4.1.0.0-6"},"message":"Product 'l-system-update' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.0-2' < available version '4.1.0.0-6'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:memtest86","check_name":"Product 'memtest86' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"memtest86","version":"5.01-2","available_version":"6.20-1"},"message":"Product 'memtest86' is outdated on depot 'ast14.uib.local'. Installed version '5.01-2' < available version '6.20-1'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:networklocation","check_name":"Product 'networklocation' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"networklocation","version":"1.0-1","available_version":"4.2.0.0-1"},"message":"Product 'networklocation' is outdated on depot 'ast14.uib.local'. Installed version '1.0-1' < available version '4.2.0.0-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-auto-update","check_name":"Product 'opsi-auto-update' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-auto-update","version":"4.1.0.3-1","available_version":"4.2.0.6-2"},"message":"Product 'opsi-auto-update' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.3-1' < available version '4.2.0.6-2'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-client-agent","check_name":"Product 'opsi-client-agent' on 'ast14.uib.local'","check_status":"error","details":{"depot_id":"ast14.uib.local","product_id":"opsi-client-agent","version":"4.1.1.16-2","available_version":"4.2.0.65-3"},"message":"Mandatory product 'opsi-client-agent' is outdated on depot 'ast14.uib.local'. Installed version '4.1.1.16-2' < available version '4.2.0.65-3'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-client-kiosk","check_name":"Product 'opsi-client-kiosk' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-client-kiosk","version":"4.1.1.6-5","available_version":"4.2.0.0-11"},"message":"Product 'opsi-client-kiosk' is outdated on depot 'ast14.uib.local'. Installed version '4.1.1.6-5' < available version '4.2.0.0-11'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-clonezilla","check_name":"Product 'opsi-clonezilla' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-clonezilla","version":"4.1.0.2-1","available_version":"4.2.0.0-1"},"message":"Product 'opsi-clonezilla' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-1' < available version '4.2.0.0-1'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-configed","check_name":"Product 'opsi-configed' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-configed","version":"4.1.9.3.3-1","available_version":"4.2.22.10-1"},"message":"Product 'opsi-configed' is outdated on depot 'ast14.uib.local'. Installed version '4.1.9.3.3-1' < available version '4.2.22.10-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-linux-client-agent","check_name":"Product 'opsi-linux-client-agent' on 'ast14.uib.local'","check_status":"error","details":{"depot_id":"ast14.uib.local","product_id":"opsi-linux-client-agent","version":"4.1.1.6-1","available_version":"4.2.0.40-1"},"message":"Mandatory product 'opsi-linux-client-agent' is outdated on depot 'ast14.uib.local'. Installed version '4.1.1.6-1' < available version '4.2.0.40-1'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-logviewer","check_name":"Product 'opsi-logviewer' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-logviewer","version":"3.1-8","available_version":"3.1-9"},"message":"Product 'opsi-logviewer' is outdated on depot 'ast14.uib.local'. Installed version '3.1-8' < available version '3.1-9'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-script-test","check_name":"Product 'opsi-script-test' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-script-test","version":"4.12.4.0-1","available_version":"4.12.10.0-3"},"message":"Product 'opsi-script-test' is outdated on depot 'ast14.uib.local'. Installed version '4.12.4.0-1' < available version '4.12.10.0-3'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-setup-detector","check_name":"Product 'opsi-setup-detector' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-setup-detector","version":"4.1.0.15-1","available_version":"4.2.1.19-1"},"message":"Product 'opsi-setup-detector' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.15-1' < available version '4.2.1.19-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-template-with-admin","check_name":"Product 'opsi-template-with-admin' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-template-with-admin","version":"4.1.0.0-2","available_version":"4.1.0.0-4"},"message":"Product 'opsi-template-with-admin' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.0-2' < available version '4.1.0.0-4'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-uefi-netboot","check_name":"Product 'opsi-uefi-netboot' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-uefi-netboot","version":"4.1.0.0-1","available_version":"4.2.0.0-1"},"message":"Product 'opsi-uefi-netboot' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.0-1' < available version '4.2.0.0-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-wan-config-off","check_name":"Product 'opsi-wan-config-off' on 'ast14.uib.local'","check_status":"ok","details":{"depot_id":"ast14.uib.local","product_id":"opsi-wan-config-off","version":"4.1.0-1","available_version":"4.1.0-1"},"message":"Installed version of product 'opsi-wan-config-off' on depot 'ast14.uib.local' is '4.1.0-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-wan-config-on","check_name":"Product 'opsi-wan-config-on' on 'ast14.uib.local'","check_status":"ok","details":{"depot_id":"ast14.uib.local","product_id":"opsi-wan-config-on","version":"4.1.0-1","available_version":"4.1.0-1"},"message":"Installed version of product 'opsi-wan-config-on' on depot 'ast14.uib.local' is '4.1.0-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-wim-capture","check_name":"Product 'opsi-wim-capture' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-wim-capture","version":"4.1.0.1-8","available_version":"4.2.0.8-2"},"message":"Product 'opsi-wim-capture' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.1-8' < available version '4.2.0.8-2'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-winpe","check_name":"Product 'opsi-winpe' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-winpe","version":"4.1.0-1","available_version":"4.2.0-1"},"message":"Product 'opsi-winpe' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0-1' < available version '4.2.0-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-winst","check_name":"Product 'opsi-winst' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"opsi-winst","version":"4.12.4.4-1","available_version":"4.12.10.0-4"},"message":"Product 'opsi-winst' is outdated on depot 'ast14.uib.local'. Installed version '4.12.4.4-1' < available version '4.12.10.0-4'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:shutdownwanted","check_name":"Product 'shutdownwanted' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"shutdownwanted","version":"1.0-6","available_version":"1.0-8"},"message":"Product 'shutdownwanted' is outdated on depot 'ast14.uib.local'. Installed version '1.0-6' < available version '1.0-8'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:sles12sp3","check_name":"Product 'sles12sp3' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"sles12sp3","version":"4.1.0.1-1","available_version":"4.2.0.2-4"},"message":"Product 'sles12sp3' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.1-1' < available version '4.2.0.2-4'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:sles12sp4","check_name":"Product 'sles12sp4' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"sles12sp4","version":"4.1.0.1-1","available_version":"4.2.0.2-4"},"message":"Product 'sles12sp4' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.1-1' < available version '4.2.0.2-4'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:swaudit","check_name":"Product 'swaudit' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"swaudit","version":"4.1.0.4-1","available_version":"4.2.0.1-1"},"message":"Product 'swaudit' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.4-1' < available version '4.2.0.1-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:ubuntu","check_name":"Product 'ubuntu' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"ubuntu","version":"4.1.0.4-2","available_version":"4.2.0.6-3"},"message":"Product 'ubuntu' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.4-2' < available version '4.2.0.6-3'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:ubuntu18-04","check_name":"Product 'ubuntu18-04' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"ubuntu18-04","version":"4.1.0.4-2","available_version":"4.2.0.1-12"},"message":"Product 'ubuntu18-04' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.4-2' < available version '4.2.0.1-12'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:ubuntu20-04","check_name":"Product 'ubuntu20-04' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"ubuntu20-04","version":"4.1.0.4-2","available_version":"4.2.0.1-12"},"message":"Product 'ubuntu20-04' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.4-2' < available version '4.2.0.1-12'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:ucs44","check_name":"Product 'ucs44' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"ucs44","version":"4.1.0.2-1","available_version":"4.2.0.1-8"},"message":"Product 'ucs44' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-1' < available version '4.2.0.1-8'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win10","check_name":"Product 'win10' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win10","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win10' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win10-captured","check_name":"Product 'win10-captured' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win10-captured","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win10-captured' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win10-x64","check_name":"Product 'win10-x64' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win10-x64","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win10-x64' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win10-x64-captured","check_name":"Product 'win10-x64-captured' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win10-x64-captured","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win10-x64-captured' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win2008-r2","check_name":"Product 'win2008-r2' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win2008-r2","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win2008-r2' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win2012","check_name":"Product 'win2012' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win2012","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win2012' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win2012-r2","check_name":"Product 'win2012-r2' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win2012-r2","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win2012-r2' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win2016","check_name":"Product 'win2016' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win2016","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win2016' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win2019","check_name":"Product 'win2019' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win2019","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win2019' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win7","check_name":"Product 'win7' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win7","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win7' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win7-captured","check_name":"Product 'win7-captured' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win7-captured","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win7-captured' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win7-x64","check_name":"Product 'win7-x64' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win7-x64","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win7-x64' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win7-x64-captured","check_name":"Product 'win7-x64-captured' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win7-x64-captured","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win7-x64-captured' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win81","check_name":"Product 'win81' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win81","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win81' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win81-captured","check_name":"Product 'win81-captured' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win81-captured","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win81-captured' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win81-x64","check_name":"Product 'win81-x64' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win81-x64","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win81-x64' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:win81-x64-captured","check_name":"Product 'win81-x64-captured' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"win81-x64-captured","version":"4.1.0.2-4","available_version":"4.2.0.5-2"},"message":"Product 'win81-x64-captured' is outdated on depot 'ast14.uib.local'. Installed version '4.1.0.2-4' < available version '4.2.0.5-2'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:windomain","check_name":"Product 'windomain' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"windomain","version":"1.0-11","available_version":"2.1-1"},"message":"Product 'windomain' is outdated on depot 'ast14.uib.local'. Installed version '1.0-11' < available version '2.1-1'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:windows10-upgrade","check_name":"Product 'windows10-upgrade' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"windows10-upgrade","version":"20.09-1","available_version":"22h2-2"},"message":"Product 'windows10-upgrade' is outdated on depot 'ast14.uib.local'. Installed version '20.09-1' < available version '22h2-2'.","upgrade_issue":null},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:wipedisk","check_name":"Product 'wipedisk' on 'ast14.uib.local'","check_status":"warning","details":{"depot_id":"ast14.uib.local","product_id":"wipedisk","version":"1.1-1","available_version":"2.3-7"},"message":"Product 'wipedisk' is outdated on depot 'ast14.uib.local'. Installed version '1.1-1' < available version '2.3-7'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:ast14.uib.local:opsi-script","check_name":"Product 'opsi-script' on 'ast14.uib.local'","check_status":"error","details":{"depot_id":"ast14.uib.local","product_id":"opsi-script"},"message":"Mandatory product 'opsi-script' is not installed on depot 'ast14.uib.local'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:test-depot-1.uib.local:opsi-client-agent","check_name":"Product 'opsi-client-agent' on 'test-depot-1.uib.local'","check_status":"error","details":{"depot_id":"test-depot-1.uib.local","product_id":"opsi-client-agent"},"message":"Mandatory product 'opsi-client-agent' is not installed on depot 'test-depot-1.uib.local'.","upgrade_issue":"4.3"},{"check_description":"","check_id":"product_on_depots:test-depot-1.uib.local:opsi-script","check_name":"Product 'opsi-script' on 'test-depot-1.uib.local'","check_status":"error","details":{"depot_id":"test-depot-1.uib.local","product_id":"opsi-script"},"message":"Mandatory product 'opsi-script' is not installed on depot 'test-depot-1.uib.local'.","upgrade_issue":"4.3"}],"check_description":"Check opsi package versions on depots","check_id":"products_on_depots","check_name":"Products on depots","check_status":"error","details":{"products":59,"depots":2,"not_installed":3,"outdated":54},"message":"Out of 59 products on 2 depots checked, 3 mandatory products are not installed, 54 are out of date.","upgrade_issue":"4.3"},{"partial_results":[],"check_description":"Check opsi package versions on clients","check_id":"products_on_clients","check_name":"Products on clients","check_status":"ok","details":{"outdated_clients":0},"message":"All important products are up to date on all clients.","upgrade_issue":null},{"partial_results":[],"check_description":"Check use of deprecated RPC methods","check_id":"deprecated_calls","check_name":"Deprecated RPCs","check_status":"ok","details":{},"message":"No deprecated method calls found.","upgrade_issue":null}
  ]
}
