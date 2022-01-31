export default {
  title: 'Input/I Filter T Changes',
  parameters: { docs: { description: { component: 'Input for Filter Table Changes' } } }
}

const PrimaryTemplate = () => ({
  template: '<InputIFilterTChanges />'
})

// named export Primary to create respective story
export const IFilterTChanges = PrimaryTemplate.bind({})
