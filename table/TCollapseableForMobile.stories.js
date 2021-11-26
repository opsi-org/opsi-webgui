export default {
  title: 'Table/T CollapseableForMobile',
  parameters: { docs: { description: { component: 'Table Collapseable for Mobile view' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTCollapseableForMobile />'
})

// named export Primary to create respective story
export const TCollapseableForMobile = PrimaryTemplate.bind({})
