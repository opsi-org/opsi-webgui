export default {
  title: 'View/V Client Creation',
  parameters: { docs: { description: { component: 'New opsi client creation view' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVClientCreation />'
})

// named export Primary to create respective story
export const VClientCreation = PrimaryTemplate.bind({})
