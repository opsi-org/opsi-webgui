
export default {
  title: 'Button/BTN Clear Selection',
  parameters: { docs: { description: { component: 'Button/BTN Clear Selection' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNClearSelection />'
})

// named export Primary to create respective story
export const BTNClearSelection = PrimaryTemplate.bind({})
