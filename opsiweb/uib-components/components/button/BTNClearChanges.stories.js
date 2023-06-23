
export default {
  title: 'Button/BTN Clear Changes',
  parameters: { docs: { description: { component: 'Button to clear tracked changes' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNClearChanges />'
})

// named export Primary to create respective story
export const BTNClearChanges = PrimaryTemplate.bind({})
