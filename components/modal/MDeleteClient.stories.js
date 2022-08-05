export default {
  title: 'Modal/M Delete Client',
  parameters: { docs: { description: { component: 'Modal for client deletion' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ModalMDeleteClient v-bind="args" />'
})

export const MDeleteClient = PrimaryTemplate.bind({})
MDeleteClient.args = {
  clientId: 'client1.domain.local'
}
