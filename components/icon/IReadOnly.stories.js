export default {
  title: 'Icon/I Read Only',
  parameters: { docs: { description: { component: 'Icon Read Only' } } }
}

const DefaultVisibleTemplateHead = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<IconIReadOnly v-bind="args" />'
})
export const IReadOnly = DefaultVisibleTemplateHead.bind({})
IReadOnly.args = {
  config: { read_only: true }
}
