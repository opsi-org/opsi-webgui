export default {
  title: 'Bar/B Breadcrumb',
  parameters: { docs: { description: { component: 'Breadcrumb for page navigation' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<BarBBreadcrumbRow :specific-items="crumbs" />',
  computed: {
    crumbs () { return args.items }
  }
})

export const BBreadcrumb = PrimaryTemplate.bind({})
BBreadcrumb.args = {
  items: [
    { text: 'first', to: { name: '#' } },
    { text: 'second', to: { name: '#' } },
    { text: 'third', to: { name: '#' } }
  ]
}
