export default {
  title: 'Dropdown/DD Table Column Visibility',
  parameters: { docs: { description: { component: 'Dropdown/DDTableColumnVisibilty description' } } }
}

const DefaultVisibleTemplateHead = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<DropdownDDTableColumnVisibilty :table-id="$props.id"
  :headers="$props.headers" />
  />
  `
})

export const DDTableColumnVisibility = DefaultVisibleTemplateHead.bind({})

DDTableColumnVisibility.args = {
  propsid: 'tableId',
  headers: {
    sel: { label: '', key: 'sel', visible: true, _fixed: true },
    a: { label: 'A', key: 'a', visible: true, sortable: false },
    b: { label: 'B', key: 'b', visible: true, sortable: false },
    _M: { label: 'M', key: '_M', _isMajor: true, visible: false },
    m1: { label: 'm1', key: 'm1', _majorKey: '_M', visible: true, sortable: true },
    m2: { label: 'm2', key: 'm2', _majorKey: '_M', visible: true, sortable: true },
    z: { key: 'z', label: 'Z', visible: true, _fixed: true }
  }
}
