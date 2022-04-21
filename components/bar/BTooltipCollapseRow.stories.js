
export default {
  title: 'bar/B Tooltip Collapse Row',
  parameters: { docs: { description: { component: 'Bar/BTooltipCollapseRow description' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<BarBTooltipCollapseRow v-bind="args" />'
})

export const BTooltipCollapseRow = DefaultVisibleTemplate.bind({})
BTooltipCollapseRow.args = {
  title: 'Title',
  value: 'Content',
  valueVariant: 'primary',
  collapseable: true,
  collapsed: false
}
