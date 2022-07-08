export default {
  title: 'Navitem/N I Title',
  parameters: { docs: { description: { component: 'Nav Title' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<NavItemNITitle v-bind="args" />'
})

// named export Primary to create respective story
export const NITitle = PrimaryTemplate.bind({})
NITitle.args = {
  expanded: true,
  title: 'Manage'
}
