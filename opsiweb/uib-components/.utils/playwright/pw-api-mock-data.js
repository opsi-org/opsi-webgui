
const rnd = (max = 11) => { return Math.floor(Math.random() * max) }
const depotIds = ['configserver.domain.local', 'depot1.domain.local', 'depot2.domain.local', 'depot3.domain.local']
const depotObjs = [{ depotId: depotIds[0], ident: depotIds[0], type: 'OpsiConfigserver', ip: '192.168.12.3', description: '', selected: 0 }]
for (let i = 1; i < depotIds.length; i++) {
  depotObjs.push(
    { depotId: depotIds[i], ident: depotIds[i], type: 'OpsiDepotserver', ip: '192.168.12.' + i + '0', description: '',selected:0 }
  )
}
const clientIds = []
const clientObj = []
for (let i = 0; i < 19; i++) {
  const id = 'client-' + [i] + '-domain.local'
  clientIds.push(id)
  clientObj.push({ clientId: id, ident: id, macAddress: 'af:fe:af:fe:af:f1', description: '', notes: '', version_outdated: rnd(), installationStatus_unknown: rnd(), installationStatus_installed: rnd(), actionResult_failed: rnd(), actionResult_successful: rnd(), selected: 0 })
}
const selectedClient = clientIds[1]
// const selectedClientObj = clientObj[1]
const selectedClientDepot = depotIds[0]
const clientProducts = []
const productIds = ['Windows Activation', 'config-win-base', 'config-win10', 'onfig-win81-desktop', 'hwaudit', 'jedit', 'l-debuntu-upgrde', 'l-desktop', 'l-opsi-server', 'l-opsi-server-migrate', 'l-opsi-server-register-depot', 'l-os-postinst', 'l-ssh-root-login', 'l-system-upgrade', 'l-virtualbox', 'networklocation', 'l-opsi-auto-update']
for (let i = 0; i < 19; i++) { productIds.push('product-' + i) }

for (const i in productIds) {
  clientProducts.push(
    {
      productId: productIds[i],
      name: 'Name of ' + productIds[i],
      priority: 0,
      description: 'Description of ' + productIds[i],
      advice: 'Advice of ' + productIds[i],
      selectedDepots: [selectedClientDepot],
      selectedClients: [selectedClient],
      installationStatusErrorLevel: 2,
      installationStatus: 'not_installed',
      actionRequest: 'none',
      actionProgress: '',
      actionResultErrorLevel: 2,
      actionResult: 'none',
      modificationTime: null,
      clientVersions: null,
      client_version_outdated: false,
      actions: [
        'setup',
        'uninstall',
        'update',
        'none'
      ],
      depot_version_diff: false,
      not_on_all_depots: false,
      numDepots: 1,
      depotVersions: [
        '5.5.0-6'
      ],
      productType: 'LocalbootProduct',
      selected: 0
    }
  )
}
clientProducts[0].installationStatus = 'installed'
clientProducts[0].actionResult = 'successful'
clientProducts[1].installationStatus = 'unknown'
clientProducts[1].actionResult = 'failed'
clientProducts[2].actionRequest = 'update'
clientProducts[3].installationStatus = 'unknown'
clientProducts[3].failed = 'unknown'
clientProducts[3].actionRequest = 'setup'
clientProducts[5].installationStatus = 'installed'
clientProducts[5].actionResult = 'successful'

const groups = {
  groups: { id: 'groups;None', type: 'HostGroup', text: 'groups', parent: null, children: [
    { id: 'groups;TestGroup1', type: 'HostGroup', text: 'TestGroup1', parent: 'groups', children: [], allowed: true },
    { id: 'groups;TestGroup2', type: 'HostGroup', text: 'TestGroup2', parent: 'groups', children: [], allowed: true },
    { id: 'groups;TestGroup3', type: 'HostGroup', text: 'TestGroup3', parent: 'groups', children: [], allowed: true }
  ], allowed: true },
  clientdirectory: { id: 'clientdirectory;None', type: 'HostGroup', text: 'clientdirectory', parent: null, children: [
    { id: 'clientdirectory;ClientDirGroup1', type: 'HostGroup', text: 'ClientDirGroup1', parent: 'clientdirectory', children: [], allowed: true },
    { id: 'clientdirectory;ClientDirGroup2', type: 'HostGroup', text: 'ClientDirGroup2', parent: 'clientdirectory', children: [], allowed: true },
    { id: 'clientdirectory;ClientDirGroup3', type: 'HostGroup', text: 'ClientDirGroup3', parent: 'clientdirectory', children: [], allowed: true }

  ], allowed: true },
  clientlist: { id: 'clientlist;None', type: 'HostGroup', text: 'clientlist', parent: null, children: null, hasAnySelection: true, allowed: true }
}

const hostObjAttributes = [{ hostId: selectedClient, type: 'OpsiClient', description: '', notes: '', hardwareAddress: '', ipAddress: null, inventoryNumber: '', systemUUID: '', created: '2023-07-03T10:14:51', lastSeen: '2023-07-03T10:14:51', opsiHostKey: '1111111111111111111111111111111', oneTimePassword: null, uefi: false }]

const serverAttribute = [{"hostId":depotObjs[0].depotId,"type":depotObjs[0].type,"description":"","notes":"","hardwareAddress":"af:fe:af:fe:af:fe","ipAddress":"192.168.12.3","inventoryNumber":"","systemUUID":null,"opsiHostKey":"ebc3bfc5bb7658ae921406a5e72e9ead","depotLocalUrl":"file:///var/lib/opsi/depot","depotRemoteUrl":"smb://192.168.12.3/opsi_depot","depotWebdavUrl":"webdavs://192.168.12.3:4447/depot","repositoryLocalUrl":"file:///var/lib/opsi/repository","repositoryRemoteUrl":"webdavs://192.168.12.3:4447/repository","workbenchLocalUrl":"file:///var/lib/opsi/workbench","workbenchRemoteUrl":"smb://192.168.12.3/opsi_workbench","networkAddress":"192.168.0.0/16","maxBandwidth":0,"isMasterDepot":true,"masterDepotId":null}]

module.exports.data = {
  hostObjAttributes,
  depotIds,
  clientIds,
  selectedClientDepot,
  depotObjs,
  clientObj,
  groups,
  clientProducts,
  serverAttribute
}