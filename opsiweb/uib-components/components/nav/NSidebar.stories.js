export default {
  title: 'Nav/N Sidebar',
  parameters: { docs: { description: { component: 'Nav for Sidebar' } } }
}

const PrimaryTemplate = () => ({
  template: '<NavNSidebar :expanded="true" />'
})
const PrimaryTemplate2 = () => ({
  template: '<NavNSidebar :expanded="false" />'
})

// named export Primary to create respective story
export const NSidebarExpanded = PrimaryTemplate.bind({})
export const NSidebarNotExpanded = PrimaryTemplate2.bind({})
