export default {
  title: 'Nav/NI Dropdown Hoverable',
  parameters: { docs: { description: { component: 'Navitem Dropdown hoverable' } } }
}

const PrimaryTemplate = () => ({
  template: '<NavItemNIDropdownHoverable />'
})

// named export Primary to create respective story
export const NIDropdownHoverable = PrimaryTemplate.bind({})
