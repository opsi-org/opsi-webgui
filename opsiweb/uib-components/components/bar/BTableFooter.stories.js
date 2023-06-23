
export default {
  title: 'bar/B Table Footer',
  parameters: { docs: { description: { component: 'Table footer' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<BarBTableFooter :pagination="{ tableData: { perPage: args.perPage, pageNumber: args.pageNumber }, totalRows: args.totalRows, totalpages: args.totalpages }" />'
})

export const BTableFooter = DefaultVisibleTemplate.bind({})
BTableFooter.args = { perPage: 5, pageNumber: 1, totalRows: 15, totalpages: 3 }
