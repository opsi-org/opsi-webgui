import { argTypeTextContent } from '../../.utils/types/ttestconsts'
export default {
  title: 'Button/BTN Help Tooltip',
  parameters: { docs: { description: { component: 'Help button to get to know some new features' } } },
  argTypes: {
    tooltiptext: argTypeTextContent
  }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<ButtonBTNHelpTooltip id="btnHelpTT" triggers="hover" :tooltip="${args.tooltiptext}||$props.tooltiptext"/>`
})

export const BTNHelpTooltip = PrimaryTemplate.bind({})
