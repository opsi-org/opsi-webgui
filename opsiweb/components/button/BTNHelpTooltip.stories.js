import { argTypeTextContent } from '~/scripts/types/ttestconsts'
export default {
  title: 'Button/BTN Help Tooltip',
  parameters: { docs: { description: { component: 'Button/BTNHelpTooltip description' } } },
  argTypes: {
    tooltiptext: argTypeTextContent
  }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<ButtonBTNHelpTooltip id="btnHelpTT" triggers="hover" :tooltip="${args.tooltiptext}||$props.tooltiptext"/>`
})

export const BTNHelpTooltip = PrimaryTemplate.bind({})
