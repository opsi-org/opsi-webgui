export default {
  title: 'View/V AdmiMaintenance',
  parameters: { docs: { description: { component: 'Page for backup maintenance' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ViewVAdminMaintenance />'
})

export const VAdminMaintenance = PrimaryTemplate.bind({})
