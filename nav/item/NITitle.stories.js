export default {
  title: 'Navitem/N I Title',
  parameters: { docs: { description: { component: 'Navitem Title' } } }
}

const PrimaryTemplate = () => ({
  template: '<NavItemNITitle />'
})

// named export Primary to create respective story
export const NITitle = PrimaryTemplate.bind({})
