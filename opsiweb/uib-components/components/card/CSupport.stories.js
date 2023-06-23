export default {
  title: 'Card/C Support',
  parameters: { docs: { description: { component: 'Cards in support page' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<CardCSupport :item="{title: args.title, description: args.content, link:args.link, buttonname: args.buttonname}" />'
})

export const CSupport = PrimaryTemplate.bind({})
CSupport.args = {
  title: 'Card title',
  content: 'This is a sample description of the card. It can be a long test.',
  buttonname: 'Link Button',
  link: '.'
}
