import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/server/health').reply(() => [200, data.diagnostic])

export default {
  title: 'View/V Healthcheck',
  parameters: { docs: { description: { component: 'Healthcheck View' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVHealthCheck />'
})

export const VHealthcheck = PrimaryTemplate.bind({})
