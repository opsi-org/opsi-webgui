import { argTypeBoolTrue, argTypeText, argTypeTextTitle, argTypeVariants } from '../../.utils/types/ttestconsts'

// Describe card component
export default {
  title: 'Bar/B Page Header',
  parameters: { docs: { description: { component: 'Bar/BPageHeader description' } } },
  argTypes: {
    variant: argTypeVariants,
    title: argTypeTextTitle,
    collapsed: argTypeBoolTrue,
    bold: argTypeBoolTrue,
    slotleft: argTypeText,
    slotright: argTypeText,
    navbartype: { defaultValue: 'collapse', control: { type: 'select', options: ['None', 'collapse'] } }
  }
}

// Define template for Story
const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<BarBPageHeader
    :variant="${_args.variant}||$props.variant"
    :navbartype="$props.navbartype"
    :collapsed="$props.collapsed"
    :title="$props.title"
    :bold="$props.bold"
    closeroute="./"
    >
      <template #left> {{$props.slotleft}} </template>
      <template #right> {{$props.slotright}} </template>
    </BarBPageHeader>
    `
  // @click="$props.collapsed = !$props.collapsed"
  // <div v-if="$props.collapsed"> content </div>
})

// named export to create respective story
export const BPageHeader = PrimaryTemplate.bind({})
BPageHeader.args = { variant: 'transparent' }
