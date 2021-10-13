// import { argTypeVariants } from '~/scripts/types/ttestconsts'
export default {
  title: 'Button/BTN Delete All',
  parameters: { docs: { description: { component: 'Button/BTNInfo description' } } }
  // argTypes: {
  //   hide: { action: 'clicked' },
  // }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNDeleteAll :click="$props.onclick" />'
})

// named export Primary to create respective story
export const BTNDeleteAll = PrimaryTemplate.bind({})
