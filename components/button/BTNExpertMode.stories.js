import { argTypeBoolFalse } from '~/.utils/types/ttestconsts'

// import { argTypeVariants } from '~/.utils/types/ttestconsts'
export default {
  title: 'Button/BTN Expert Mode',
  parameters: { docs: { description: { component: 'Button/BTNExpertMode description' } } },
  argTypes: {
    // hide: { action: 'clicked' },
    navbar: argTypeBoolFalse
  }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<ButtonBTNExpertMode :navbar="${args.navbar}||$props.navbar" />`
})

// named export Primary to create respective story
export const BTNExpertMode = PrimaryTemplate.bind({})
export const BTNExpertModeNavbar = PrimaryTemplate.bind({})
BTNExpertModeNavbar.args = { navbar: true }
