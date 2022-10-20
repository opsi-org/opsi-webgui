import { customstores } from '../../../.utils/storybook/mock'
export default {
  title: 'Gridcell/G C Product Property Value',
  parameters: { docs: { description: { component: 'Grid cell for Productproperty Value' } } }
}

// TODO Check the issue with stories.

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args }, allOptionsUnique () { return [''] } },
  template: '<GridCellGCProductPropertyValue v-bind="args" />',
  store: customstores({
    selections: {
      namespaced: true,
      getters: {
        selectionClients () { return [] },
        selectionDepots () { return ['server.domain.local'] }
      }
    },
    'config-app': {
      namespaced: true,
      getters: {
        config () { return undefined }
      }
    },
    changes: {
      namespaced: true,
      getters: {
        changesProducts () { return args.changeslist }
      },
      mutations: {
        deleteFromProdChangesWhere () { return null }
      }
    },
    settings: {
      namespaced: true,
      getters: {
        quicksave () { return false }
      }
    }
  })
})

export const GCProductPropertyValue = PrimaryTemplate.bind({})
GCProductPropertyValue.args = {
  rowItem: {
    productId: 'activate-win',
    propertyId: 'httpproxy',
    type: 'UnicodeProductProperty',
    defaultDetails: { 'server.domain.local': [''] },
    depots: { 'server.domain.local': [''] },
    clients: {},
    allValues: [''],
    versionDetails: { 'server.domain.local': '1.0-9' },
    descriptionDetails: { 'server.domain.local': 'httpproxy needed for activation proxy.mycompany.com:3218' },
    multiValueDetails: { 'server.domain.local': false },
    editableDetails: { 'server.domain.local': true },
    possibleValues: { 'server.domain.local': [''] },
    version: '1.0-9',
    description: 'httpproxy needed for activation proxy.mycompany.com:3218',
    multiValue: false,
    editable: true,
    default: [''],
    allClientValuesEqual: true,
    newValue: '',
    newValues: [],
    anyDepotDifferentFromDefault: false,
    anyClientDifferentFromDepot: false
  },
  clients2depots: {},
  showValue: false,
  selectedValues: [''],
  isOrigin: true
}
