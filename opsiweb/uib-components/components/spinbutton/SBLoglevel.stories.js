export default {
  title: 'Spinbutton/SB Loglevel',
  parameters: { docs: { description: { component: 'Spin button for Loglevel' } } }
}

const PrimaryTemplate = () => ({
  template: '<SpinbuttonSBLoglevel />'
})

// named export Primary to create respective story
export const SBLoglevel = PrimaryTemplate.bind({})
