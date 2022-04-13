export default {
  title: 'Button/BTN Expert Mode',
  parameters: { docs: { description: { component: 'Button/BTNExpertMode description' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ButtonBTNExpertMode :navbar="args.navbar" />'
})

// named export Primary to create respective story
export const BTNExpertMode = PrimaryTemplate.bind({})
BTNExpertMode.args = { navbar: false }
export const BTNExpertModeNavbar = PrimaryTemplate.bind({})
BTNExpertModeNavbar.args = { navbar: true }
