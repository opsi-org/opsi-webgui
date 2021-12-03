import { argTypeBoolFalse, argTypeBoolTrue, argTypeTextContent, argTypeTextTitle, argTypeVariants } from '~/.utils/types/ttestconsts'

export default {
  title: 'bar/B Tooltip Collapse Row',
  parameters: { docs: { description: { component: 'Bar/BTooltipCollapseRow description' } } },
  argTypes: {
    title: argTypeTextTitle,
    value: argTypeTextContent,
    valueVariant: argTypeVariants,
    collapseable: argTypeBoolTrue,
    collapsed: argTypeBoolFalse
  }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: ` <BarBTooltipCollapseRow
  :title="${args.title}||$props.title"
  :value="${args.value}||$props.value"
  :collapsed="${args.collapsed}||$props.collapsed"
  :collapseable="${args.collapseable}||$props.collapseable"
  :value-variant="${args.valueVariant}||$props.valueVariant"
>
  `
})

export const BTooltipCollapseRow = DefaultVisibleTemplate.bind({})
// BTooltipCollapseRow.args = {
//   totalRows: 20,
//   pageNumber: 1,
//   perPage: 10
// }
