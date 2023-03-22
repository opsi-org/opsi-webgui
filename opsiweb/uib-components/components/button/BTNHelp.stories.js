export default {
  title: 'Button/BTN Help',
  parameters: { docs: { description: { component: 'Button/BTNHelp description' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNHelp :id="egal" />'
})

export const BTNHelp = PrimaryTemplate.bind({})
