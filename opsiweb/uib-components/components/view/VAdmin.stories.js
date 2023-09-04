import { mock } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/blocked-clients').reply(() => [200, []])
mock.onGet('/api/opsidata/locked-products').reply(() => [200, []])

export default {
  title: 'View/V Admin',
  parameters: { docs: { description: { component: 'Admin Page' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ViewVAdmin />'
})

export const VAdmin = PrimaryTemplate.bind({})
