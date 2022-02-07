import { store } from '../../.utils/storybook/mock'
import { argTypeBoolFalse, argTypeBoolTrue } from '../../.utils/types/ttestconsts'

export default {
  title: 'bar/B Side',
  parameters: { docs: { description: { component: 'Bar/BSide description' } } },
  argTypes: {
    visible: argTypeBoolTrue,
    expanded: argTypeBoolFalse
  }
}

const DefaultAuthVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  store: store(), // to keep the default (duration: 2min) (note: authentication is enabled by default currently)
  template: `<BarBSide class="sidebar_content"
    :attributes="{
      visible: $props.visible,
      expanded: $props.expanded
    }" />
  `
})

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<BarBSide class="sidebar_content"
  :attributes="{
    visible: ${args.visible}||$props.visible,
    expanded: ${args.expanded}||$props.expanded
  }" />
  `
})

export const BSideSmall = DefaultVisibleTemplate.bind({})
export const BSideSmallAuthenticated = DefaultAuthVisibleTemplate.bind({})

export const BSideExpanded = DefaultVisibleTemplate.bind({})
BSideExpanded.args = { expanded: true }
export const BSideExpandedAuthenticated = DefaultAuthVisibleTemplate.bind({})
BSideExpandedAuthenticated.args = { expanded: true }
