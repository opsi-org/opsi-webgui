export default {
  title: 'Modal/M Clientreachable',
  parameters: { docs: { description: { component: 'Modal for showing client reachability' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ModalMClientReachable />'
})

export const MClientreachable = PrimaryTemplate.bind({})
