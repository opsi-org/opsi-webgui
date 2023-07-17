export default {
  title: 'Modal/M Productactions',
  parameters: { docs: { description: { component: 'Modal for product actions' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ModalMProductActions />'
})

export const MProductactions = PrimaryTemplate.bind({})
