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
const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<BarBPageHeader
    :variant="${args.variant}||$props.variant"
    :navbartype="${args.navbartype}||$props.navbartype"
    :collapsed="${args.collapsed}||$props.collapsed"
    :title="${args.title}||$props.title"
    :bold="${args.bold}||$props.bold"
    closeroute="./"
    >
    <template #left> {{${args.slotleft}||$props.slotleft}} </template>
    <template #right> {{${args.slotright}||$props.slotright}} </template>
    </BarBPageHeader>
    `
  // @click="$props.collapsed = !$props.collapsed"
  // <div v-if="$props.collapsed"> content </div>
})

// named export to create respective story
export const BPageHeader = PrimaryTemplate.bind({})
BPageHeader.args = {
  variant: 'primary',
  // variant: argTypeVariants,
  title: 'argTypeTextTitle',
  collapsed: true,
  bold: true,
  slotleft: 'argTypeTextLeft',
  slotright: 'argTypeTextRight',
  navbartype: 'collapse'
}
