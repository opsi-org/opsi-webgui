export default {
  title: 'Modal/M Prodsaveoverview',
  parameters: { docs: { description: { component: 'Modal for Product Save Overview' } } }
}

const PrimaryTemplate = () => ({
  template: '<ModalMProdSaveOverview />'
})

// named export Primary to create respective story
export const MProdSaveOverview = PrimaryTemplate.bind({})
