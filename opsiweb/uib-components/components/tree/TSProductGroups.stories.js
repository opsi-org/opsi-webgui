import { mock, data } from '../../.utils/storybook/mock'
mock.onGet(`/api/opsidata/products/groups?selectedProducts=${''}`).reply(200, data.groups.products)

export default {
  title: 'Tree/TS Product Groups',
  parameters: { docs: { description: { component: 'Treeselect for product groups' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSProductGroups />'
})

export const TSProductGroups = PrimaryTemplate.bind({})
