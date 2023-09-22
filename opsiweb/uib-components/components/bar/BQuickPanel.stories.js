import { mock, data } from '../../.utils/storybook/mock'
mock.onGet(/\/api\/opsidata\/depot_ids/).reply(200, data.depotIds)
mock.onGet(/\/api\/opsidata\/depots\/clients/).reply(200, data.clientIds)
mock.onGet(/\/api\/opsidata\/hosts\/groups-dynamic/).reply(200, { groups: data.groups.hostgroups })
mock.onGet(/\/api\/opsidata\/products\/groups/).reply(200, { groups: data.groups.productgroups.groups })
mock.onGet(/\/api\/opsidata\/products\/action-result/).reply(200, ['a-r-0', 'a-r-1'])
mock.onGet(/\/api\/opsidata\/products\/installation-status/).reply(200, ['i-s-0', 'i-s-1'])

export default {
  title: 'bar/B Quick Panel',
  parameters: { docs: { description: { component: 'QuickPanel' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<BarBQuickPanel :show-quick-panel="true" />'
})

export const BQuickPanel = DefaultVisibleTemplate.bind({})
