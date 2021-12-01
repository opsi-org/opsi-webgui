export default {
  title: 'Modal/M Deleteclient',
  parameters: { docs: { description: { component: 'Modal for DeleteClient' } } }
}

const PrimaryTemplate = () => ({
  template: '<ModalMDeleteClient />'
})

// named export Primary to create respective story
export const MDeleteClient = PrimaryTemplate.bind({})
