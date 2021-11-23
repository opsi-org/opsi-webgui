export default {
  title: 'View/V Clients Log',
  parameters: { docs: { description: { component: 'Client Logs' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVClientsLog />'
})

// named export Primary to create respective story
export const VClientsLog = PrimaryTemplate.bind({})
