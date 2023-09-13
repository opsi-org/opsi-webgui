// import { store } from '../../.utils/storybook/mock'
import { mock, data } from '../../.utils/storybook/mock'
// mock.onGet('/api/opsidata/hosts/groups?selectedDepots=[<config-server-id>]&selectedClients=[]&parentGroup=root').reply(200, data.groups.hostgroups)
// mock.onGet('/api/opsidata/hosts/groups?selectedDepots=[]&selectedClients=[]&parentGroup=root').reply(200, data.groups.hostgroups)
// mock.onGet(/\/api\/opsidata\/depots\/clients**/).reply(200, data.clientIds)
mock.onGet(/\/api\/opsidata\/depot_ids/).reply(200, data.depotIds)
mock.onGet(/\/api\/opsidata\/depots\/clients/).reply(200, data.clientIds)
mock.onGet(/\/api\/opsidata\/hosts\/groups-dynamic/).reply(200, { groups: data.groups.hostgroups })
mock.onGet(/\/api\/opsidata\/products\/groups/).reply(200, { groups: data.groups.productgroups.groups })
mock.onGet(/\/api\/opsidata\/products\/action-result/).reply(200, ['a-r-0', 'a-r-1'])
mock.onGet(/\/api\/opsidata\/products\/installation-status/).reply(200, ['i-s-0', 'i-s-1'])
// mock.onGet('/api/opsidata/hosts/groups-dynamic?selectedDepots=[]&selectedClients=[]&parentGroup=root').reply(200, { groups: data.groups.hostgroups })
// api/opsidata/products/groups?selectedProducts
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
// BQuickPanel.args = { attributes: { expanded: false, visible: true } }

// todo clicking on expand-btn not possible (only in storebook - why??)
// export const BSideSmall = DefaultVisibleTemplate.bind({})
// BSideSmall.args = { attributes: { expanded: false, visible: true } }

// export const BSideSmallAuthenticated = DefaultVisibleAuthTemplate.bind({})
// BSideSmallAuthenticated.args = { attributes: { expanded: false, visible: true, authenticated: true } } // small

// export const BSideSmall = DefaultVisibleTemplate.bind({})
// export const BSideSmallAuthenticated = DefaultVisibleTemplate.bind({})
// BSideSmall.args = { ...attrs }
// BSideSmallAuthenticated.args = { ...attrs, authenticated: true }
