export default {
  title: 'View/V ClientsAddNew',
  parameters: { docs: { description: { component: 'Client subpage for creating new opsi client' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVClientsAddNew />'
})

// named export Primary to create respective story
export const VClientsAddNew = PrimaryTemplate.bind({})
