// import { moveSyntheticComments } from 'typescript'
import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/hosts/groups?selectedDepots=[<config-server-id>]&selectedClients=[]&parentGroup=root').reply(200, data.groups.hosts)
mock.onGet('/api/opsidata/hosts/groups?selectedDepots=[]&selectedClients=[]&parentGroup=root').reply(200, data.groups.hostgroups)
mock.onGet('/api/opsidata/depots/clients?selectedDepots=[<config-server-id>]').reply(200, data.clientIds)
mock.onGet('/api/opsidata/depots/clients?selectedDepots=[]').reply(200, data.clientIds)
mock.onGet('/api/opsidata/hosts/groups-dynamic?selectedDepots=[]&selectedClients=[]&parentGroup=root').reply(200, { groups: data.hostgroups })
mock.onGet('**/api/opsidata/groups-dynamic**').reply(200, { groups: data.hostgroups })

export default {
  title: 'Tree/TS Host Groups',
  parameters: { docs: { description: { component: 'Treeselect for host groups with delayed loading children' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSHostGroups />'
})

export const TSHostGroups = PrimaryTemplate.bind({})
