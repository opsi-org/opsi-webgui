import { argTypeBoolFalse, argTypeBoolTrue } from '../../.utils/types/ttestconsts'

export default {
  title: 'bar/B Side',
  parameters: { docs: { description: { component: 'Bar/BSide description' } } },
  argTypes: {
    visible: argTypeBoolTrue,
    expanded: argTypeBoolFalse
  }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `
  <BarBSide class="sidebar_content" :attributes="{ visible: ${args.visible}||$props.visible, expanded: ${args.expanded}||$props.expanded }" />
  `
})

export const BSide = DefaultVisibleTemplate.bind({})

export const BSideExpanded = DefaultVisibleTemplate.bind({})
BSideExpanded.args = { expanded: true }
