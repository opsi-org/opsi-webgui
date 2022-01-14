import { argTypeBoolFalse, argTypeBoolTrue } from '../../.utils/types/ttestconsts'

export default {
  title: 'bar/B Top',
  parameters: { docs: { description: { component: 'Bar/BTop description' } } },
  argTypes: {
    visible: argTypeBoolTrue,
    expanded: argTypeBoolFalse
  }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `
  <BarBTop class="topbar_content" :attributes="{ visible: $props.visible, expanded: $props.expanded }" />
  `
})

export const BTop = DefaultVisibleTemplate.bind({})
// BTop.args = { visible: true, expanded: false }
