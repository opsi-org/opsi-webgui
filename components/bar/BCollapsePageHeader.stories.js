// import { mock, data } from '../../.utils/storybook/mock'

// mock.onGet('/api/opsidata/hosts/groups').reply(200, data.groups.hosts)

// Describe card component
export default {
  title: 'Bar/B Collapse Page Header',
  parameters: { docs: { description: { component: 'Bar/BCollapsePageHeader description' } } }
}

// Define template for Story
const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<BarBCollapsePageHeader v-bind="args" />'
})

// named export to create respective story
export const BCollapsePageHeader = PrimaryTemplate.bind({})
BCollapsePageHeader.args = {
  id: 'id',
  title: 'title',
  rowId: 'rowId',
  collapsed: false,
  collapseable: true,
  enableDepots: true,
  enableClients: true,
  enableProducts: false,
  enableShowProducts: true,
  tableInfo: {},
  redirectOnCloseTo: undefined,
  redirect: () => {}
}
