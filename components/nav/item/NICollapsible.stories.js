export default {
  title: 'Navitem/N I Collapseable',
  parameters: { docs: { description: { component: 'Collapseable nav item' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<NavItemNICollapsible v-bind="args" />'
})

// named export Primary to create respective story
export const NICollapsible = PrimaryTemplate.bind({})
NICollapsible.args = {
  title: 'Servers',
  disabled: false,
  icon: 'server',
  submenu: [
    { title: 'All Servers', route: '.' },
    { title: 'Configuration', route: '.' }
  ],
  route: '.'
}
