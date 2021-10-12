// Describe card component
export default {
  title: 'Bar/B Breadcrumb',
  parameters: { docs: { description: { component: 'Bar/BBreadcrumb description' } } },
  argTypes: {
    items: {
      defaultValue: ['first', 'second'],
      control: {
        type: 'multi-select',
        options: ['first', 'second', 'third']
      }
    }
    // content: 'content'
  }
}

// Define template for Story
const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<BarBBreadcrumb :specific-items="$props.items"/>' // {{$props.default}}
})

// named export to create respective story
export const BBreadcrumb = PrimaryTemplate.bind({})
