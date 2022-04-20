export default {
  title: 'Nav/NI Title',
  parameters: { docs: { description: { component: 'Navitem Title' } } }
}

const PrimaryTemplate = () => ({
  template: '<NavItemNITitle />'
})

// named export Primary to create respective story
export const NITitle = PrimaryTemplate.bind({})
