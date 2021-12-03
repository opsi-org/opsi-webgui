export default {
  title: 'Table/T Productdependencies',
  parameters: { docs: { description: { component: 'Table for Product Dependencies' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTProductDependencies />'
})

// named export Primary to create respective story
export const TProductDependencies = PrimaryTemplate.bind({})
