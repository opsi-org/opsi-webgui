export default {
  title: 'Table/T Product Properties',
  parameters: { docs: { description: { component: 'Table for ProductProperties' } } }
}

const properties = {
  properties: {
    default: {
      productId: 'productId1', propertyId: 'default', type: 'UnicodeProductProperty', defaultDetails: { clientId1: [''] }, depots: { depot1: [] }, clients: { 'agorumcore-tst.uib.local': [''], 'akunde1.uib.local': [''] }, allValues: ['file', 'mysql'], versionDetails: { clientId1: '4.1.1.14-3' }, descriptionDetails: { clientId1: 'Which backend should be installed ? (mysql needs valid activation file' }, multiValueDetails: { clientId1: false }, editableDetails: { clientId1: false }, possibleValues: { clientId1: ['file', 'mysql'] }, anyDepotDifferentFromDefault: false, version: '4.1.1.14-3', description: 'default values and equal on clients/depots', multiValue: false, editable: false, default: [''], allClientValuesEqual: true, anyClientDifferentFromDepot: false
    },
    depotNotDefault: {
      productId: 'productId1', propertyId: 'depotNotDefault', type: 'BoolProductProperty', defaultDetails: { clientId1: [false] }, depots: { depot1: [true] }, clients: { 'agorumcore-tst.uib.local': [true], 'akunde1.uib.local': [true] }, allValues: [false, true], versionDetails: { clientId1: '4.1.1.14-3' }, descriptionDetails: { clientId1: 'May the server reboot if script is finished ?' }, multiValueDetails: { clientId1: false }, editableDetails: { clientId1: false }, possibleValues: { clientId1: [false, true] }, anyDepotDifferentFromDefault: true, version: '4.1.1.14-3', description: 'Depot is not equal to default', multiValue: false, editable: false, default: [false], allClientValuesEqual: true, anyClientDifferentFromDepot: false
    },

    clientVal: {
      productId: 'productId1', propertyId: 'clientVal', type: 'UnicodeProductProperty', defaultDetails: { clientId1: [''] }, depots: { depot1: ['file'] }, clients: { clientId1: ['fileClient'] }, allValues: ['file', 'mysql'], versionDetails: { clientId1: '4.1.1.14-3' }, descriptionDetails: { clientId1: 'Which backend should be installed ? (mysql needs valid activation file' }, multiValueDetails: { clientId1: false }, editableDetails: { clientId1: false }, possibleValues: { clientId1: ['file', 'mysql'] }, anyDepotDifferentFromDefault: true, version: '4.1.1.14-3', description: 'Client is different from depot; depot different from default', multiValue: false, editable: false, default: [''], allClientValuesEqual: true, anyClientDifferentFromDepot: true
    },
    multiValue: {
      productId: 'productId1', propertyId: 'multiValue', type: 'UnicodeProductProperty', defaultDetails: { clientId1: [''] }, depots: { depot1: ['file', 'mysql'] }, clients: { 'agorumcore-tst.uib.local': ['file', 'mysql'], 'akunde1.uib.local': ['file', 'mysql'] }, allValues: ['file', 'mysql'], versionDetails: { clientId1: '4.1.1.14-3' }, descriptionDetails: { clientId1: 'Which backend should be installed ? (mysql needs valid activation file' }, multiValueDetails: { clientId1: true }, editableDetails: { clientId1: false }, possibleValues: { clientId1: ['file', 'mysql'] }, anyDepotDifferentFromDefault: true, version: '4.1.1.14-3', description: 'multiple values selected', multiValue: true, editable: false, default: [''], allClientValuesEqual: true, anyClientDifferentFromDepot: true
    },
    clientsDifferent: { productId: 'productId1', propertyId: 'clientsDifferent', type: 'UnicodeProductProperty', defaultDetails: { clientId1: [''] }, depots: { depot1: ['file', 'mysql'] }, clients: { 'agorumcore-tst.uib.local': ['file', 'mysql'], 'akunde1.uib.local': ['file'] }, allValues: ['file', 'mysql'], versionDetails: { clientId1: '4.1.1.14-3' }, descriptionDetails: { clientId1: 'Which backend should be installed ? (mysql needs valid activation file' }, multiValueDetails: { clientId1: true }, editableDetails: { clientId1: false }, possibleValues: { clientId1: ['file', 'mysql'] }, anyDepotDifferentFromDefault: true, version: '4.1.1.14-3', description: 'different values on selected vlients', multiValue: true, editable: false, default: [''], allClientValuesEqual: false, anyClientDifferentFromDepot: true },

    very_long_property_id_and_longer_and_longer_and_longer: {
      productId: 'productId1', propertyId: 'very_long_property_id_and_longer_and_longer_and_longer', type: 'UnicodeProductProperty', defaultDetails: { clientId1: [''] }, depots: { depot1: [] }, clients: { 'agorumcore-tst.uib.local': [''], 'akunde1.uib.local': [''] }, allValues: ['file', 'mysql'], versionDetails: { clientId1: '4.1.1.14-3' }, descriptionDetails: { clientId1: 'Which backend should be installed ? (mysql needs valid activation file' }, multiValueDetails: { clientId1: false }, editableDetails: { clientId1: false }, possibleValues: { clientId1: ['file', 'mysql'] }, anyDepotDifferentFromDefault: false, version: '4.1.1.14-3', description: 'default values and equal on clients/depots', multiValue: false, editable: false, default: [''], allClientValuesEqual: true, anyClientDifferentFromDepot: false
    }
  },
  productVersions: { clientId1: '4.1.1.14-3' },
  productDescriptionDetails: { clientId1: 'Installs opsi-server packages,  configures and create adminuser' },
  productDescription: 'Installs opsi-server packages,  configures and create adminuser'
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: `<TableTProductProperties :id="args.id" :properties="args.props" :errorText="args.errorText"/>
  `
})

// named export Primary to create respective story
export const TProductProperties = PrimaryTemplate.bind({})

TProductProperties.args = {
  id: 'id',
  props: properties,
  errorText: ''
}
