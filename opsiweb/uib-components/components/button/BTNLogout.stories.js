import { argTypeVariants } from '../../.utils/types/ttestconsts'

export default {
  title: 'Button/BTN Logout',
  parameters: { docs: { description: { component: 'Logout button' } } },
  argTypes: {
    variant: argTypeVariants
  }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNLogout v-bind="$props" :abort-click="true" />'
})

export const BTNLogout = PrimaryTemplate.bind({})
