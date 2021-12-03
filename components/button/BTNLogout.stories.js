import { argTypeVariants } from '~/.utils/types/ttestconsts'

export default {
  title: 'Button/BTN Logout',
  parameters: { docs: { description: { component: 'Button/BTNLogout description' } } },
  argTypes: {
    // inNavbar: { defaultValue: true, control: { type: 'boolean' } },
    // onclick: { action: 'clicked' },
    variant: argTypeVariants
  }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNLogout v-bind="$props" :abort-click="true" />'
})

// named export Primary to create respective story
export const BTNLogout = PrimaryTemplate.bind({})
