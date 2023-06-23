export default {
  title: 'Input/I Filter T Changes',
  parameters: { docs: { description: { component: 'Input for Tracked changes filter' } } }
}

const PrimaryTemplate = () => ({
  template: '<InputIFilterTChanges />'
})

export const IFilterTChanges = PrimaryTemplate.bind({})
