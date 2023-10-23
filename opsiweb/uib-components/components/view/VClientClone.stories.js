export default {
  title: 'View/V Client Clone',
  parameters: { docs: { description: { component: 'Page for cloning a opsi client' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ViewVClientClone />'
})

export const VClientClone = PrimaryTemplate.bind({})
