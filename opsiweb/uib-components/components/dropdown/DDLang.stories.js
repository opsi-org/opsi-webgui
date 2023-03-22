export default {
  title: 'Dropdown/DD Lang',
  parameters: { docs: { description: { component: 'Dropdown/DDLang description' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<DropdownDDLang :dropup="args.dropup" />'
})

export const DDLang = DefaultVisibleTemplate.bind({})
DDLang.args = { dropup: false }
