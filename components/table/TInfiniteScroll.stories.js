
import { data } from '../../.utils/storybook/mock'

export default {
  title: 'Table/T Infinite Scroll',
  parameters: { docs: { description: { component: 'Infinite Scroll Table' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: {
    args () { return args },
    // todo: pagination broken only for tests
    items () { return args.items.slice(((args.tableData.pageNumber - 1) * args.tableData.perPage), args.tableData.perPage) }
  },
  template: `
  <TableTInfiniteScroll
    id="TableId" primary-key="TableId"

    rowident="depotId"
    :total-items="args.items.length"
    :totalpages="(args.items.length/args.tableData.perPage)"

    :header-data="args.headerData"
    :table-data="args.tableData"
    :items="items"
    />
    `
})
// named export Primary to create respective story
export const TInfiniteScroll = PrimaryTemplate.bind({})
TInfiniteScroll.args = {
  headerData: data.headerData,
  tableData: data.tableData,
  items: data.depots
}
