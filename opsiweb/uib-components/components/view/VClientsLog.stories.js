import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/log').reply(200, data.logs.clients)
// ?selectedClient=client1&selectedLogType=opsiconfd

export default {
  title: 'View/V Clients Log',
  parameters: { docs: { description: { component: 'Client Logs View' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVClientsLog id="client1"/>'
})

// named export Primary to create respective story
export const VClientsLog = PrimaryTemplate.bind({})
