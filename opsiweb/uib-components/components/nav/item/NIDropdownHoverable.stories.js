export default {
  title: 'Navitem/N I Dropdown Hoverable',
  parameters: { docs: { description: { component: 'Hoverable dropdown nav item' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<NavItemNIDropdownHoverable v-bind="args" />'
})

export const NIDropdownHoverable = PrimaryTemplate.bind({})
NIDropdownHoverable.args = {
  title: 'Servers',
  disabled: false,
  icon: 'server',
  submenu: [
    { title: 'All Servers', route: '.' },
    { title: 'Configuration', route: '.' }
  ],
  route: '.'
}
