
import { data } from '../../.utils/storybook/mock'

export default {
  title: 'Table/T Products Netboot',
  parameters: { docs: { description: { component: 'Table for ProductsNetboot' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  methods: {
    fetchProducts (thiss) {
      thiss.totalItems = args.items.length
      thiss.totalpages = (args.items.length / args.tableData.perPage)
      thiss.items = args.items
      thiss.setItemsCache(args.items)
    }
  },
  template: `<TableTProductsNetboot
    :rowident="args.rowident"
    :routeRedirectWith="args.routeRedirectWith"
    :multiselect="args.multiselect"
    :child="args.child"
    :sortBy="args.sortBy"
    :parentId="args.parentId"
    :sort="args.sort"
    :table-info="args.tableInfo"
    :filter-query="args.filterQuery"
    @fetch-products="fetchProducts"
  />
  `
})

// named export Primary to create respective story
export const TProductsNetboot = PrimaryTemplate.bind({})
TProductsNetboot.args = {
  parentId: 'productId',
  rowident: '',
  filterQuery: '',
  routeRedirectWith: () => {},
  child: false,
  sort: { sortBy: 'productId', sortDesc: false },
  headerData: data.headerDataProducts,
  items: data.products,
  tableData: data.tableDataMoreElements,
  tableInfo: {
    sortBy: 'productId',
    sortDesc: false,
    filterQuery: '',
    headerData: data.headerDataProducts
  }
}
