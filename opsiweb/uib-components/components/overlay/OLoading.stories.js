export default {
  title: 'Overlay/Loading',
  parameters: { docs: { description: { component: 'Overlay to show loading status' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<OverlayOLoading :is-loading="true" />'
})

export const Loading = PrimaryTemplate.bind({})
