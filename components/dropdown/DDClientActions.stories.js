export default {
  title: 'Dropdown/DD Client Actions',
  parameters: { docs: { description: { component: 'Dropdown for client actions' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<DropdownDDClientActions v-bind="args" />'
})

export const DDClientActions = DefaultVisibleTemplate.bind({})
DDClientActions.args = { clientId: 'client1.domain.local' }
