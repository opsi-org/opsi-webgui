
import { mock } from '../../.utils/storybook/mock'
const hostconfig = ['client1', 'client2']
mock.onGet('/api/opsidata/depots/clients').reply(200, hostconfig)

export default {
  title: 'Tree/TS Clients Not Stored',
  parameters: { docs: { description: { component: 'Treeselect for client selection, where selection not stored.' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSClientsNotStored />'
})

export const TSClientsNotStored = PrimaryTemplate.bind({})
