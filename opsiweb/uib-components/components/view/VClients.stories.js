import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/depots/clients?selectedDepots=').reply(200, data.clientIds)
mock.onGet('/api/opsidata/depot_ids').reply(200, data.depotIds)
mock.onGet('/api/opsidata/clients').reply(() => [200, data.clients, { 'x-total-count': data.clients.length }])

export default {
  title: 'View/V Clients',
  parameters: { docs: { description: { component: 'Clients view with depots and hostgroups selection' } } }
}
const PrimaryTemplate = () => ({
  template: '<ViewVClients/>'
})
export const VClients = PrimaryTemplate.bind({})
