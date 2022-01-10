
import withMock from 'storybook-addon-mock'
const { mockBackendCall } = require('../../.utils/storybook/mock')
const dependencies = {
  dependencies:[{"productId":"productId1", productAction:"setup", version:"4.1.1.14-3", requiredProductId:"l-system-update", requiredVersion:null, requiredAction:"setup", requiredInstallationStatus:null, requirementType:"before"}],
  productVersions:{ clientId1:"4.1.1.14-3"},
  productDescriptionDetails:{ clientId1:"Installs opsi-server packages, configures and create adminuser"},
  productDescription:"Installs opsi-server packages, configures and create adminuser"
}
const properties = {
  properties: {
    allow_reboot: { productId: 'productId1', propertyId: 'allow_reboot', type: 'BoolProductProperty', defaultDetails: { clientId1: [false] }, depots: { clientId1: [true] }, clients: { 'agorumcore-tst.uib.local': [true], 'akunde1.uib.local': [true] }, allValues: [false, true], versionDetails: { clientId1: '4.1.1.14-3' }, descriptionDetails: { clientId1: 'May the server reboot if script is finished ?' }, multiValueDetails: { clientId1: false }, editableDetails: { clientId1: false }, possibleValues: { clientId1: [false, true] }, anyDepotDifferentFromDefault: true, version: '4.1.1.14-3', description: 'May the server reboot if script is finished ?', multiValue: false, editable: false, default: [false], allClientValuesEqual: true, anyClientDifferentFromDepot: false },
    backend: { productId: 'productId1', propertyId: 'backend', type: 'UnicodeProductProperty', defaultDetails: { clientId1: [''] }, depots: { clientId1: ['file'] }, clients: { 'agorumcore-tst.uib.local': ['file'], 'akunde1.uib.local': ['file'] }, allValues: ['file', 'mysql'], versionDetails: { clientId1: '4.1.1.14-3' }, descriptionDetails: { clientId1: 'Which backend should be installed ? (mysql needs valid activation file' }, multiValueDetails: { clientId1: false }, editableDetails: { clientId1: false }, possibleValues: { clientId1: ['file', 'mysql'] }, anyDepotDifferentFromDefault: true, version: '4.1.1.14-3', description: 'Which backend should be installed ? (mysql needs valid activation file', multiValue: false, editable: false, default: [''], allClientValuesEqual: true, anyClientDifferentFromDepot: false }
  },
  productVersions: { clientId1: '4.1.1.14-3' },
  productDescriptionDetails: { clientId1: 'Installs opsi-server packages,  configures and create adminuser' },
  productDescription: 'Installs opsi-server packages,  configures and create adminuser'
}
export default {
  title: 'View/V Product Property',
  parameters: { docs: { description: { component: 'Product property and dependency view' } } },
  decorators: [withMock]
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<ViewVProductProperty :id="$props.id" :asChild="$props.asChild" :closeroute="$props.closeroute"/>
  `,
})

export const VProductProperty = PrimaryTemplate.bind({})
VProductProperty.args = {
  id: 'id',
  asChild: 'asChild',
  closeroute: 'closeroute'
}
VProductProperty.parameters = {
  mockData: [
    mockBackendCall(
      'products/id/dependencies?selectedClients=[]&selectedDepots=[]',
      dependencies,
      'GET',
      '200'
    ),
    mockBackendCall(
      'products/id/properties?selectedClients=[]&selectedDepots=[]',
      properties,
      'GET',
      '200'
    )
  ]
}