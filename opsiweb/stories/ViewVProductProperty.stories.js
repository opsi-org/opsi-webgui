export default {
  title: 'View/V ProductProperty',
  parameters: { docs: { description: { component: 'ProductProperty and Dependency View' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVProductProperty />'
})

// named export Primary to create respective story
export const VProductProperty = PrimaryTemplate.bind({})
