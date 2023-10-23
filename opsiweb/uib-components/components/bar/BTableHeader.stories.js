
export default {
  title: 'bar/B Table Header',
  parameters: { docs: { description: { component: 'Table header' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<BarBTableHeader />'
})

export const BTableHeader = DefaultVisibleTemplate.bind({})
