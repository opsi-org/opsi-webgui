export default {
  title: 'Dropdown/DD Default',
  parameters: { docs: { description: { component: 'Dropdown/DDDefault description' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<DropdownDDDefault
    :is-origin="$props.isOrigin"
    :options="$props.options"
    :selected-items="$props.selectedItems"
    :multiple="$props.multiple"
    @change="(s) => { (JSON.stringify([...s].sort())==JSON.stringify([...$props.selectedItems].sort()))? $props.isOrigin = true : $props.isOrigin = false }"
  />
  `
})

export const DDDefaultSingle = DefaultVisibleTemplate.bind({})
DDDefaultSingle.args = {
  isOrigin: true,
  options: ['a', 'b', 'c'],
  selectedItems: ['a'],
  multiple: false
}

// export const DDDefaultSingleNotOrigin = DefaultVisibleTemplate.bind({})
// DDDefaultSingleNotOrigin.args = {
//   ...DDDefaultSingleOrigin.args,
//   isOrigin: false
// }
export const DDDefaultMulti = DefaultVisibleTemplate.bind({})
DDDefaultMulti.args = {
  ...DDDefaultSingle.args,
  selectedItems: ['a', 'b'],
  multiple: true
}
// export const DDDefaultMultiNotOrigin = DefaultVisibleTemplate.bind({})
// DDDefaultMultiNotOrigin.args = {
//   ...DDDefaultMultiOrigin.args,
//   isOrigin: false
// }
