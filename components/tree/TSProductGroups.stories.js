import { mock, data } from '../../.utils/storybook/mock'

mock.onGet('/api/opsidata/products/groups').reply(200, data.groups.products)

export default {
  title: 'Tree/TS Product Groups',
  parameters: { docs: { description: { component: 'Treeselect for product groups' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSProductGroups />'
})

// named export Primary to create respective story
export const TSProductGroup = PrimaryTemplate.bind({})
