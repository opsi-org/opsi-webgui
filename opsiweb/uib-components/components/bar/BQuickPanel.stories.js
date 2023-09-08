// import { store } from '../../.utils/storybook/mock'
import { mock, data } from '../../.utils/storybook/mock'
// mock.onGet('/api/opsidata/hosts/groups?selectedDepots=[<config-server-id>]&selectedClients=[]&parentGroup=root').reply(200, data.groups.hostgroups)
// mock.onGet('/api/opsidata/hosts/groups?selectedDepots=[]&selectedClients=[]&parentGroup=root').reply(200, data.groups.hostgroups)
mock.onGet('/api/opsidata/depots/clients?selectedDepots=[<config-server-id>]').reply(200, data.clientIds)
mock.onGet('/api/opsidata/depots/clients?selectedDepots=[]').reply(200, data.clientIds)
mock.onGet(`/api/opsidata/products/groups?selectedProducts=${''}`).reply(200, data.groups.products)

mock.onGet('/api/opsidata/hosts/groups-dynamic?selectedDepots=[]&selectedClients=[]&parentGroup=root').reply(200, { groups: data.groups.hostgroups })
mock.onGet('**/api/opsidata/groups-dynamic**').reply(200, { groups: data.groups.hostgroups })

export default {
  title: 'bar/B Quick Panel',
  parameters: { docs: { description: { component: 'QuickPanel' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<BarBQuickPanel  :show-quick-panel="true" />'
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
