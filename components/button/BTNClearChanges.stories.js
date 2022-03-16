// import { argTypeVariants } from '../../.utils/types/ttestconsts'
export default {
  title: 'Button/BTN Clear Changes',
  parameters: { docs: { description: { component: 'Button/BTN Clear Changes' } } }
  // argTypes: {
  //   hide: { action: 'clicked' },
  // }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNClearChanges />'
})

// named export Primary to create respective story
export const BTNClearChanges = PrimaryTemplate.bind({})
