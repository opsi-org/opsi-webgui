import { mock } from '../../.utils/storybook/mock'

const pid = 'dummy-product-id'
const dependencies = {
  dependencies: [{ productId: 'productId1', productAction: 'setup', version: '4.1.1.14-3', requiredProductId: 'l-system-update', requiredVersion: null, requiredAction: 'setup', requiredInstallationStatus: null, requirementType: 'before' }],
  productVersions: { clientId1: '4.1.1.14-3' },
  productDescriptionDetails: { clientId1: 'Installs opsi-server packages, configures and create adminuser' },
  productDescription: 'Installs opsi-server packages, configures and create adminuser'
}
const properties = {
  properties: {
    allow_reboot: { productId: 'productId1', propertyId: 'allow_reboot', type: 'BoolProductProperty', defaultDetails: { clientId1: [false] }, depots: { clientId1: [true] }, clients: { 'agorumcore-tst.uib.local': [true], 'akunde1.uib.local': [true] }, allValues: [false, true], versionDetails: { clientId1: '4.1.1.14-3' }, descriptionDetails: { clientId1: 'May the server reboot if script is finished ?' }, multiValueDetails: { clientId1: false }, editableDetails: { clientId1: false }, possibleValues: { clientId1: [false, true] }, anyDepotDifferentFromDefault: true, version: '4.1.1.14-3', description: 'May the server reboot if script is finished ?', multiValue: false, editable: false, default: [false], allClientValuesEqual: true, anyClientDifferentFromDepot: false },
    backend: { productId: 'productId1', propertyId: 'backend', type: 'UnicodeProductProperty', defaultDetails: { clientId1: [''] }, depots: { clientId1: ['file'] }, clients: { 'agorumcore-tst.uib.local': ['file'], 'akunde1.uib.local': ['file'] }, allValues: ['file', 'mysql'], versionDetails: { clientId1: '4.1.1.14-3' }, descriptionDetails: { clientId1: 'Which backend should be installed ? (mysql needs valid activation file' }, multiValueDetails: { clientId1: false }, editableDetails: { clientId1: false }, possibleValues: { clientId1: ['file', 'mysql'] }, anyDepotDifferentFromDefault: true, version: '4.1.1.14-3', description: 'Which backend should be installed ? (mysql needs valid activation file', multiValue: false, editable: false, default: [''], allClientValuesEqual: true, anyClientDifferentFromDepot: false }
  },
  productVersions: { clientId1: '4.1.1.14-3' },
  productDescriptionDetails: { clientId1: 'A test product' },
  productDescription: 'A test product'
  // productDescriptionDetails: { clientId1: 'Installs opsi-server packages,  configures and create adminuser' },
  // productDescription: 'Installs opsi-server packages,  configures and create adminuser'
}

export default {
  title: 'View/V Product Property',
  parameters: { docs: { description: { component: 'Product property and dependency view' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: `<ViewVProductProperty :id='args.id' :asChild='args.asChild' :closeroute='args.closeroute'/>
  `
})
mock.onGet(`/api/opsidata/products/${pid}/dependencies?selectedClients=[]&selectedDepots=[<config-server-id>]`).reply(200, dependencies)
mock.onGet(`/api/opsidata/products/${pid}/dependencies?selectedClients=[]&selectedDepots=[]`).reply(200, dependencies)
mock.onGet(`/api/opsidata/products/${pid}/properties?selectedClients=[]&selectedDepots=[<config-server-id>]`).reply(200, properties)
mock.onGet(`/api/opsidata/products/${pid}/properties?selectedClients=[]&selectedDepots=[]`).reply(200, properties)

export const VProductProperty = PrimaryTemplate.bind({})
VProductProperty.args = {
  id: pid,
  asChild: 'asChild',
  closeroute: 'closeroute'
}
