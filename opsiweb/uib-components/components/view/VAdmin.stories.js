export default {
  title: 'View/V Admin',
  parameters: { docs: { description: { component: 'Admin' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ViewVAdmin />'
})

export const VAdmin = PrimaryTemplate.bind({})