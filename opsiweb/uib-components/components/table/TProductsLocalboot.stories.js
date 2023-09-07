
import { data, mock } from '../../.utils/storybook/mock'

const result = [
  {
    productId: 'prod1',
    name: 'Windows Activation',
    description: 'Tries to activate this Windows installation',
    selectedDepots: ['as-tp.uib.local'],
    selectedClients: null,
    installationStatus: 'not_installed',
    actionRequest: null,
    actionProgress: null,
    actionResult: null,
    clientVersions: null,
    client_version_outdated: false,
    actions: ['setup', 'none'],
    depot_version_diff: false,
    depotVersions: ['1.0-9'],
    productType: 'LocalbootProduct',
    selected: 0
  },
  {
    productId: 'prod2',
    name: 'Windows Customizing',
    description: 'Anpassung von Windows XP / Vista / Win7 Einstellungen',
    selectedDepots: ['as-tp.uib.local'],
    selectedClients: null,
    installationStatus: 'not_installed',
    actionRequest: null,
    actionProgress: null,
    actionResult: null,
    clientVersions: null,
    client_version_outdated: false,
    actions: ['setup', 'none'],
    depot_version_diff: false,
    depotVersions: ['4.0.1-1'],
    productType: 'LocalbootProduct',
    selected: 0
  },
  {
    productId: 'prod3',
    name: 'Configure Windows 10',
    description:
      'Configure various Windows 10 settings like lockscreen, hibernationboot, telemetry sending and update behavior.',
    selectedDepots: ['as-tp.uib.local'],
    selectedClients: null,
    installationStatus: 'not_installed',
    actionRequest: null,
    actionProgress: null,
    actionResult: null,
    clientVersions: null,
    client_version_outdated: false,
    actions: ['setup', 'none'],
    depot_version_diff: false,
    depotVersions: ['4.1.1-9'],
    productType: 'LocalbootProduct',
    selected: 0
  }
]

mock.onGet('/api/opsidata/products').reply(200, result, { 'x-total-count': result.length })

export default {
  title: 'Table/T Products Localboot',
  parameters: { docs: { description: { component: 'Localboot Products Table' } } }
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
  template: `<TableTProductsLocalboot
    :rowident="args.rowident"
    :routeRedirectWith="args.routeRedirectWith"
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

export const TProductsLocalboot = PrimaryTemplate.bind({})
TProductsLocalboot.args = {
  parentId: 'productId',
  rowident: '',
  filterQuery: '',
  routeRedirectWith: () => {},
  child: false,
  sort: { sortBy: 'productId', sortDesc: false },
  items: data.products,
  tableData: data.tableDataMoreElements,
  tableInfo: {
    sortBy: 'productId',
    sortDesc: false,
    filterQuery: '',
    headerData: data.headerDataProducts
  }
}
