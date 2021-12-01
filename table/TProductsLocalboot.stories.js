export default {
  title: 'Table/T Productslocalboot',
  parameters: { docs: { description: { component: 'Table for ProductsLocalboot' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTProductsLocalboot />'
})

// named export Primary to create respective story
export const TProductsLocalboot = PrimaryTemplate.bind({})
