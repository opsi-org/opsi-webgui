export default {
  title: 'Table/T Product Properties',
  parameters: { docs: { description: { component: 'Table for ProductProperties' } } }
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

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<TableTProductProperties :id="$props.id" :properties="$props.props" :errorText="$props.errorText"/>
  `
})

// named export Primary to create respective story
export const TProductProperties = PrimaryTemplate.bind({})

TProductProperties.args = {
  id: 'id',
  props: properties,
  errorText: 'errorText'
}
