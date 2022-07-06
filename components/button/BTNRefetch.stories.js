import { argTypeVariants } from '../../.utils/types/ttestconsts'

export default {
  title: 'Button/BTN Refetch',
  parameters: { docs: { description: { component: 'Refetch Button' } } },
  argTypes: {
    variant: argTypeVariants
  }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNRefetch v-bind="$props" />'
})

// named export Primary to create respective story
export const BTNRefetch = PrimaryTemplate.bind({})
