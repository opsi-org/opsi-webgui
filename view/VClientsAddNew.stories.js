export default {
  title: 'View/V Clients Add New',
  parameters: { docs: { description: { component: 'New opsi client creation view' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVClientsAddNew />'
})

// named export Primary to create respective story
export const VClientsAddNew = PrimaryTemplate.bind({})
