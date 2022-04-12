// Describe card component
export default {
  title: 'Bar/B Breadcrumb',
  parameters: { docs: { description: { component: 'Bar/BBreadcrumb description' } } }
}

// Define template for Story
const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<BarBBreadcrumbRow :specific-items="crumbs" />',
  computed: {
    crumbs () { return args.items }
  }
})

// named export to create respective story
export const BBreadcrumb = PrimaryTemplate.bind({})
BBreadcrumb.args = {
  items: [
    { text: 'first', to: { name: '#' } },
    { text: 'second', to: { name: '#' } },
    { text: 'third', to: { name: '#' } }
  ]
}
