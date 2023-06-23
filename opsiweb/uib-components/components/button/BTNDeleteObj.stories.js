// import { argTypeVariants } from '../../.utils/types/ttestconsts'
export default {
  title: 'Button/BTN Delete Obj',
  parameters: { docs: { description: { component: 'Button to delete an object from a list' } } }
  // argTypes: {
  //   hide: { action: 'clicked' },
  // }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNDeleteObj />'
})

// named export Primary to create respective story
export const BTNDeleteObj = PrimaryTemplate.bind({})
