export default {
  title: 'Tablecell/T C Badge Compares',
  parameters: { docs: { description: { component: 'Table cell for Badge compares' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TableCellTCBadgeCompares />'
})

// named export Primary to create respective story
export const TCBadgeCompares = PrimaryTemplate.bind({})
