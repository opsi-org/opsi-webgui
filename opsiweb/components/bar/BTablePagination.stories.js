export default {
  title: 'bar/B Table Pagination',
  parameters: { docs: { description: { component: 'Bar/BTablePagination description' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<BarBTablePagination :total-rows="${args.totalRows}"
    :tabledata="{ pageNumber: ${args.pageNumber}, perPage: ${args.perPage}, setPageNumber: (x) => {}, setPerPage: (x) => {} }"
  />
  `
})

export const BTablePagination = DefaultVisibleTemplate.bind({})
BTablePagination.args = {
  totalRows: 20,
  pageNumber: 1,
  perPage: 10
}
