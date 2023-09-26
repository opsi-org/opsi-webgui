import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/server/diagnostic').reply(() => [200, data.diagnostic])
mock.onGet('/api/opsidata/server/health').reply(() => [200, data.health])

export default {
  title: 'Tabs/T Server Health',
  parameters: { docs: { description: { component: 'Tabs for health check and diagnostics' } } }
}

const PrimaryTemplate = () => ({
  template: '<TabsTServerHealth />'
})

export const TServerHealth = PrimaryTemplate.bind({})
