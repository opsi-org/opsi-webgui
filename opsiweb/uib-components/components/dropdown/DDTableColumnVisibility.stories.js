export default {
  title: 'Dropdown/DD Table Column Visibility',
  parameters: { docs: { description: { component: 'Dropdown to select table column' } } }
}

const DefaultVisibleTemplateHead = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<DropdownDDTableColumnVisibility :table-id="args.id" :headers.sync="args.headers" :sort-by="args.sortBy" :multi="args.multi" />'
})

export const DDTableColumnVisibility = DefaultVisibleTemplateHead.bind({})

DDTableColumnVisibility.args = {
  propsid: 'tableId',
  multi: true,
  sortBy: 'c',
  headers: {
    sel: { label: '', key: 'sel', visible: true, _fixed: true },
    desc: { label: 'Description', key: 'desc', visible: true, sortable: false },
    ip: { label: 'IP', key: 'ip', visible: false, sortable: false },
    mac: { key: 'mac', label: 'MAC', visible: false, _fixed: false },
    _M: { label: 'Last Seen', key: '_M', _isMajor: true, visible: false },
    m1: { label: 'm1', key: 'm1', _majorKey: '_M', visible: true, sortable: true },
    m2: { label: 'm2', key: 'm2', _majorKey: '_M', visible: true, sortable: true },
    z: { key: 'z', label: 'Z', visible: true, _fixed: true }
  }
}
