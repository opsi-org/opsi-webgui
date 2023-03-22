export default {
  title: 'Dropdown/DD Theme',
  parameters: { docs: { description: { component: 'Dropdown/DDTheme description' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<DropdownDDTheme :navbar="args.navbar"/>'
})

// export const DDTheme = DefaultVisibleTemplate.bind({})
// DDTheme.args = { navbar: true }
export const DDTheme = DefaultVisibleTemplate.bind({})
DDTheme.args = { navbar: false }
