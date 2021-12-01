export default {
  title: 'Input/I Filter',
  parameters: { docs: { description: { component: 'Input for filter' } } }
}

const PrimaryTemplate = () => ({
  template: '<InputIFilter />'
})

// named export Primary to create respective story
export const IFilter = PrimaryTemplate.bind({})
