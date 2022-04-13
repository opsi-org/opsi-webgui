export default {
  title: 'Dropdown/DD Table Sorting',
  parameters: { docs: { description: { component: 'Dropdown/DDTableSorting description' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<DropdownDDTableSorting :table-id="args.id" v-bind.sync="args.tableInfo" />'
})

export const DDTableSorting = DefaultVisibleTemplate.bind({})
DDTableSorting.args = {
  id: 'tableId',
  tableInfo: {
    sortBy: 'a',
    sortDesc: false,
    headerData: {
      sel: { label: 'sel', key: 'sel', visible: true, sortable: true, _fixed: true },
      a: { label: 'A', key: 'a', visible: true, sortable: true },
      b: { label: 'B', key: 'b', visible: false, sortable: true },
      c: { key: 'c', label: 'C', visible: false, sortable: true, _fixed: false },
      _M: { label: 'M', key: '_M', _isMajor: true, visible: false },
      m1: { label: 'm1', key: 'm1', _majorKey: '_M', visible: true, sortable: true },
      m2: { label: 'm2', key: 'm2', _majorKey: '_M', visible: true, sortable: true },
      z: { key: 'z', label: 'Z', visible: true, _fixed: true }
    },
    filterQuery: ''
  }
}
