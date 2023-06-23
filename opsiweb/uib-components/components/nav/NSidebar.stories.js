export default {
  title: 'Nav/N Sidebar',
  parameters: { docs: { description: { component: 'Side Navbar for page navigation' } } }
}

const PrimaryTemplate = () => ({
  template: '<NavNSidebar :expanded="true" />'
})
const PrimaryTemplate2 = () => ({
  template: '<NavNSidebar :expanded="false" />'
})

export const NSidebarExpanded = PrimaryTemplate.bind({})
export const NSidebarNotExpanded = PrimaryTemplate2.bind({})
