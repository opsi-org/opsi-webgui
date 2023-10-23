export default {
  title: 'Modal/M Rename Client',
  parameters: { docs: { description: { component: 'Modal for client renaming' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ModalMRenameClient v-bind="args" />'
})

export const MRenameClient = PrimaryTemplate.bind({})
MRenameClient.args = {
  clientId: 'client1.domain.local'
}
