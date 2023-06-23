export default {
  title: 'Bar/B Auth Footer',
  parameters: { docs: { description: { component: 'Login Page Footer' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<BarBAuthFooter class="footer_content" />'
})

export const BAuthFooter = PrimaryTemplate.bind({})
