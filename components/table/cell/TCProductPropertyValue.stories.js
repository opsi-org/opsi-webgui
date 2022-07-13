import { customstores } from '../../../.utils/storybook/mock'
export default {
  title: 'Tablecell/T C Product Property Value',
  parameters: { docs: { description: { component: 'Table cell for Productproperty Value' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TableCellTCProductPropertyValue v-bind="args" />',
  store: customstores({
    selections: {
      namespaced: true,
      getters: {
        selectionClients () { return ['client1.domain.local', 'client2.domain.local', 'client3.domain.local'] },
        selectionDepots () { return ['depot1.domain.local', 'depot2.domain.local'] }
      }
    },
    'config-app': {
      namespaced: true,
      getters: {
        config () { return { read_only: false } }
      }
    },
    changes: {
      namespaced: true,
      getters: {
        changesProducts () { return args.changeslist }
      },
      mutations: {
        deleteFromChangesWhere () { return null }
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

export const TCProductPropertyValue = PrimaryTemplate.bind({})
TCProductPropertyValue.args = {
  rowItem: {
    type: 'BoolProductProperty',
    editable: false,
    propertyId: 'propertyId'
  },
  visibleValueBoolIndeterminate: true,
  clients2depots: {},
  showValue: true,
  selectedValues: []
}
