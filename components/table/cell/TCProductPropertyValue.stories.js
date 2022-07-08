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
    config: {
      namespaced: true,
      getters: {
        config () { return { read_only: false } }
      }
    }
  })
})

// named export Primary to create respective story
export const TCProductPropertyValue = PrimaryTemplate.bind({})
TCProductPropertyValue.args = {
  rowItem: {
    type: 'BoolProductProperty',
    editable: false,
    propertyId: 'propertyId'
  },
  visibleValueBoolIndeterminate: true,
  clients2depots: {}
}
