export default {
  title: 'Navitem/N I Item',
  parameters: { docs: { description: { component: 'Nav item' } } }
}

const PrimaryTemplate = () => ({
  template: '<NavItemNIItem />'
})

// named export Primary to create respective story
export const NIItem = PrimaryTemplate.bind({})
