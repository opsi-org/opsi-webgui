import { argTypeVariants } from '../../.utils/types/ttestconsts'

export default {
  title: 'Button/BTN Info',
  parameters: { docs: { description: { component: 'Info button' } } },
  argTypes: {
    onclick: { action: 'clicked' },
    variant: argTypeVariants
  }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNInfo :click="$props.onclick" />'
})

export const BTNInfo = PrimaryTemplate.bind({})
