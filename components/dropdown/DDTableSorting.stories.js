export default {
  title: 'Dropdown/DD Table Sorting',
  parameters: { docs: { description: { component: 'Dropdown/DDTableSorting description' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<b-badge variant="light"><DropdownDDTableSorting :table-id="args.id" v-bind.sync="args.tableInfo" incontentmenu /></b-badge>'
})

export const DDTableSorting = DefaultVisibleTemplate.bind({})
DDTableSorting.args = {
  id: 'tableId',
  tableInfo: {
    sortBy: 'sel',
    sortDesc: false,
    headerData: {
      sel: { label: 'Selection', key: 'sel', visible: true, sortable: true, _fixed: true },
      description: { label: 'Description', key: 'description', visible: true, sortable: true },
      type: { label: 'Type', key: 'type', visible: false, sortable: true },
      ip: { key: 'ip', label: 'IP', visible: false, sortable: true, _fixed: false },
      _M: { label: 'M', key: '_M', _isMajor: true, visible: false },
      mac: { label: 'MAC', key: 'mac', _majorKey: '_M', visible: true, sortable: true },
      modified: { label: 'Modified', key: 'modified', _majorKey: '_M', visible: true, sortable: true },
      z: { key: 'z', label: 'Z', visible: true, _fixed: true }
    },
    filterQuery: ''
  }
}
