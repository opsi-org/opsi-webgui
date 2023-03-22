// import { mock } from '../../.utils/storybook/mock'
// const hostconfig = ['depot1', 'depot2']
// mock.onGet('/api/opsidata/depot_ids').reply(200, hostconfig)

export default {
  title: 'Tree/TS Depots Not Stored',
  parameters: { docs: { description: { component: 'Treeselect for depot selection, where selection not stored' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSDepotsNotStored />'
})

// named export Primary to create respective story
export const TSDepotsNotStored = PrimaryTemplate.bind({})
