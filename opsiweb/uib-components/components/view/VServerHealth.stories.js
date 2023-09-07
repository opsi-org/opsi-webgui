import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/server/diagnostic').reply(() => [200, data.diagnostic])
mock.onGet('/api/opsidata/server/health').reply(() => [200, data.health])

export default {
  title: 'View/V Server Health',
  parameters: { docs: { description: { component: 'Healthcheck View' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVServerHealth />'
})

export const VServerHealth = PrimaryTemplate.bind({})
