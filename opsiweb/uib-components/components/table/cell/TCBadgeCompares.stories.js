export default {
  title: 'Tablecell/T C Badge Compares',
  parameters: { docs: { description: { component: 'Table cell for Product Comparison' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TableCellTCBadgeCompares />'
})

export const TCBadgeCompares = PrimaryTemplate.bind({})
