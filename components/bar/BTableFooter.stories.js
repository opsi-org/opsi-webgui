
export default {
  title: 'bar/B Table Footer',
  parameters: { docs: { description: { component: 'Bar/BTableFooter description' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<BarBTableFooter :pagination="{ tableData: { perPage: args.perPage, pageNumber: args.pageNumber }, totalRows: args.totalRows }" />'
})

export const BTableFooter = DefaultVisibleTemplate.bind({})
BTableFooter.args = { perPage: 5, pageNumber: 1, totalRows: 15 }
