export default {
  title: 'View/V Admin Terminal',
  parameters: { docs: { description: { component: 'Admin Terminal Page' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ViewVAdminTerminal />'
})

export const VAdminTerminal = PrimaryTemplate.bind({})
