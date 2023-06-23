export default {
  title: 'Button/BTN Help',
  parameters: { docs: { description: { component: 'Help button to get to know some new features' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNHelp :id="egal" />'
})

export const BTNHelp = PrimaryTemplate.bind({})
