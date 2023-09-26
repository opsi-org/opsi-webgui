
export default {
  title: 'Button/BTN Clear Selection',
  parameters: { docs: { description: { component: 'Button to clear selections from Table or Tree' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNClearSelection short :showLabel="false" />'
})
const PrimaryTemplateLong = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNClearSelection />'
})

// named export Primary to create respective story
export const BTNClearSelection = PrimaryTemplate.bind({})
export const BTNClearSelectionLong = PrimaryTemplateLong.bind({})
