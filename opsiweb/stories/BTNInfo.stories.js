import { argTypeVariants } from '~/scripts/types/ttestconsts'

export default {
  title: 'Button/B T N Info',
  parameters: { docs: { description: { component: 'Button/BTNInfo description' } } },
  argTypes: {
    onclick: { action: 'clicked' },
    variant: argTypeVariants
  }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNInfo :click="$props.onclick" />'
})

// named export Primary to create respective story
export const BTNInfo = PrimaryTemplate.bind({})
