export default {
  title: 'View/V Product Property',
  parameters: { docs: { description: { component: 'Product property and dependency view' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVProductProperty />'
})

// named export Primary to create respective story
export const VProductProperty = PrimaryTemplate.bind({})
