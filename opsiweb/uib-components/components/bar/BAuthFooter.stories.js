// Describe card component
export default {
  title: 'Bar/B Auth Footer',
  parameters: { docs: { description: { component: 'Bar/BAuthFooter description' } } }
}

// Define template for Story
const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<BarBAuthFooter class="footer_content" />' // {{$props.default}}
})

// named export to create respective story
export const BAuthFooter = PrimaryTemplate.bind({})
