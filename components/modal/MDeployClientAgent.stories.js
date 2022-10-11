export default {
  title: 'Modal/M Deploy Client Agent',
  parameters: { docs: { description: { component: 'Modal for deploy client agent' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ModalMDeployClientAgent v-bind="args" />'
})

export const MDeployClientAgent = PrimaryTemplate.bind({})
MDeployClientAgent.args = {
  clientId: 'client1.domain.local'
}
