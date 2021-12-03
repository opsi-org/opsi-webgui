export default {
  title: 'Navitem/N I Collapsible',
  parameters: { docs: { description: { component: 'Navitem Collapsible' } } }
}

const PrimaryTemplate = () => ({
  template: '<NavItemNICollapsible />'
})

// named export Primary to create respective story
export const NICollapsible = PrimaryTemplate.bind({})
