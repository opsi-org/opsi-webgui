export default {
  title: 'View/V Client Creation',
  parameters: { docs: { description: { component: 'Page for creating new opsi client' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ViewVClientCreation v-bind="args" />'
})

export const VClientCreation = PrimaryTemplate.bind({})
