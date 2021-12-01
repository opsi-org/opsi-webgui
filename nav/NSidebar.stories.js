export default {
  title: 'Nav/N Sidebar',
  parameters: { docs: { description: { component: 'Nav for Sidebar' } } }
}

const PrimaryTemplate = () => ({
  template: '<NavNSidebar />'
})

// named export Primary to create respective story
export const NSidebar = PrimaryTemplate.bind({})
