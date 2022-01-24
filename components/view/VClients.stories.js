export default {
  title: 'View/V Clients',
  parameters: { docs: { description: { component: 'Clients view with depots and hostgroups selection' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVClients/>'
})

// named export Primary to create respective story
export const VClients = PrimaryTemplate.bind({})
