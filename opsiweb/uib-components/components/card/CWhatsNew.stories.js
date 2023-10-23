export default {
  title: 'Card/C Whatsnew',
  parameters: { docs: { description: { component: 'Whats new? ' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<CardCWhatsNew />'
})

export const CWhatsnew = PrimaryTemplate.bind({})
