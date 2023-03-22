export default {
  title: 'Dropdown/DD Client Actions',
  parameters: { docs: { description: { component: 'Dropdown for client actions' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<b-badge variant="transparent"><DropdownDDClientActions v-bind="args" /></b-badge>'
})

export const DDClientActions = DefaultVisibleTemplate.bind({})
DDClientActions.args = { clientId: 'client1.domain.local' }
