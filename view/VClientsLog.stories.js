export default {
  title: 'View/V ClientsLog',
  parameters: { docs: { description: { component: 'Client Logs' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVClientsLog />'
})

// named export Primary to create respective story
export const VClientsLog = PrimaryTemplate.bind({})
