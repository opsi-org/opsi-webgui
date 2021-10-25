export default {
  title: 'Dropdown/DD Lang',
  parameters: { docs: { description: { component: 'Dropdown/DDLang description' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<DropdownDDLang
    :dropup="$props.dropup"
  />
  `
})

export const DDLang = DefaultVisibleTemplate.bind({})
DDLang.args = { dropup: false }
