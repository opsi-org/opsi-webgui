export default {
  title: 'Table/T Productsnetboot',
  parameters: { docs: { description: { component: 'Table for ProductsNetboot' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTProductsNetboot />'
})

// named export Primary to create respective story
export const TProductsNetboot = PrimaryTemplate.bind({})
