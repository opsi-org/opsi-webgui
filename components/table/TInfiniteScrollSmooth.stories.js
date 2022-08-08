
import { data } from '../../.utils/storybook/mock'
import QueueNested from '../../.utils/utils/QueueNested'

export default {
  title: 'Table/T Infinite Scroll Smooth',
  parameters: { docs: { description: { component: 'Infinite Scroll Table' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: {
    args () { return args }
  },
  template: `
  <TableTInfiniteScrollSmooth
    id="TableId" primary-key="TableId"

    rowident="depotId"
    :total-items="args.cache_pages.elementLength"
    :totalpages="args.totalpages"

    :header-data="args.headerData"
    :table-data="args.tableData"
    :cache_pages="args.cache_pages"
    :fetchitems="args.fetchitems"
    />
    `,
  watch: {
    'args.tableData.pageNumber' (newVal, _oldVal) {
      pageQueue.set(newVal, this.fetchitems())
    }
  }
})

const tableData = { ...data.tableData }
tableData.perPage = 3
const pageQueue = new QueueNested(1)
pageQueue.set(1, [...data.depots])
pageQueue.setTotalPages(data.depots.length / tableData.perPage)

// named export Primary to create respective story
export const TInfiniteScrollSmooth = PrimaryTemplate.bind({})
TInfiniteScrollSmooth.args = {
  tableData,
  headerData: data.headerData,
  totalpages: Math.ceil(data.depots.length / tableData.perPage),
  cache_pages: pageQueue,
  fetchitems: () => {
    return data.depots.slice(((tableData.pageNumber - 1) * tableData.perPage), tableData.perPage * tableData.pageNumber)
  }
}
