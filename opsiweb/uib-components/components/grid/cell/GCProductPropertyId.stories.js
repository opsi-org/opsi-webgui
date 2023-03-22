import { customstores } from '../../../.utils/storybook/mock'
export default {
  title: 'Gridcell/G C Product Property Id',
  parameters: { docs: { description: { component: 'Grid cell for Productproperty Id' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<GridCellGCProductPropertyId v-bind="args" />',
  store: customstores({
    selections: {
      namespaced: true,
      getters: {
        selectionClients () { return ['client1.domain.local', 'client2.domain.local', 'client3.domain.local'] },
        selectionDepots () { return ['depot1.domain.local', 'depot2.domain.local'] }
      }
    }
  })
})

// named export Primary to create respective story
export const GCProductPropertyId = PrimaryTemplate.bind({})
GCProductPropertyId.args = {
  row: {
    propertyId: 'propertyID',
    depots: ''
  },
  productVersions: {}
}
