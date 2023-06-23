export default {
  title: 'Button/BTN Reset',
  parameters: { docs: { description: { component: 'Reset button' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ButtonBTNReset :action="() => {}" />'
})

export const BTNReset = PrimaryTemplate.bind({})
