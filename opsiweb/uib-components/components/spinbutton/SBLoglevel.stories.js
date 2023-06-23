export default {
  title: 'Spinbutton/SB Loglevel',
  parameters: { docs: { description: { component: 'Spin button for Log level selection' } } }
}

const PrimaryTemplate = () => ({
  template: '<SpinbuttonSBLoglevel />'
})

// named export Primary to create respective story
export const SBLoglevel = PrimaryTemplate.bind({})
