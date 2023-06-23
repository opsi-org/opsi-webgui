import { customstores } from '../../../.utils/storybook/mock'
export default {
  title: 'Tablecell/T C Product Version Cell',
  parameters: { docs: { description: { component: 'Table cell for Productversion' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TableCellTCProductVersionCell v-bind="args" />',
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

export const TCProductVersionCell = PrimaryTemplate.bind({})
TCProductVersionCell.args = {
  row: {
    item: {
      productId: 'productId',
      selectedDepots: [],
      depot_version_diff: true
    }
  },
  type: 'version',
  clients2depots: {}
}
