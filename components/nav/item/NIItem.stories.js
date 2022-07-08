export default {
  title: 'Navitem/N I Item',
  parameters: { docs: { description: { component: 'Nav item without submenu' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<NavItemNIItem v-bind="args" />'
})

// named export Primary to create respective story
export const NIItem = PrimaryTemplate.bind({})
NIItem.args = {
  expanded: true,
  title: 'Servers',
  disabled: false,
  icon: 'server',
  route: '.'
}
