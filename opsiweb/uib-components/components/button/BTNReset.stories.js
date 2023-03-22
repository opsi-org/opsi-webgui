export default {
  title: 'Button/BTN Reset',
  parameters: { docs: { description: { component: 'Button/BTNReset description' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ButtonBTNReset :action="() => {}" />'
})

// named export Primary to create respective story
export const BTNReset = PrimaryTemplate.bind({})
// BTNReset.args = { isOrigin: true }
