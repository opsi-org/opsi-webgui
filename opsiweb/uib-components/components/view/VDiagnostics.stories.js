import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/server/diagnostic').reply(() => [200, data.diagnostic])

export default {
  title: 'View/V Diagnostics',
  parameters: { docs: { description: { component: 'Tab content to show Diagnostics data.' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVDiagnostics />'
})

export const VDiagnostics = PrimaryTemplate.bind({})
