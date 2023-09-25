import { mock } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/blocked-clients').reply(() => [200, []])
mock.onGet('/api/opsidata/locked-products').reply(() => [200, []])

export default {
  title: 'Tabs/T Admin',
  parameters: { docs: { description: { component: 'Admin Page Tabs' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TabsTAdmin />'
})

export const TAdmin = PrimaryTemplate.bind({})
