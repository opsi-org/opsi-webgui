// import { argTypeVariants } from '../../.utils/types/ttestconsts'
export default {
  title: 'Button/BTN Event',
  parameters: { docs: { description: { component: 'Button Event' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNEvent />'
})

// named export Primary to create respective story
export const BTNEvent = PrimaryTemplate.bind({})
