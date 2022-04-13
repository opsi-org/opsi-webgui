export default {
  title: 'Dropdown/DD Default',
  parameters: { docs: { description: { component: 'Dropdown/DDDefault description' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: `<DropdownDDDefault
    :is-origin="args.isOrigin"
    :options="args.options"
    :selected-items="args.selectedItems"
    :multiple="args.multiple"
    @change="(s) => { (JSON.stringify([...s].sort())==JSON.stringify([...args.selectedItems].sort()))? args.isOrigin = true : args.isOrigin = false }"
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

export const DDDefaultSingleNotOrigin = DefaultVisibleTemplate.bind({})
DDDefaultSingleNotOrigin.args = {
  ...DDDefaultSingle.args,
  isOrigin: false
}
export const DDDefaultMulti = DefaultVisibleTemplate.bind({})
DDDefaultMulti.args = {
  ...DDDefaultSingle.args,
  selectedItems: ['a', 'b'],
  multiple: true
}
export const DDDefaultMultiNotOrigin = DefaultVisibleTemplate.bind({})
DDDefaultMultiNotOrigin.args = {
  ...DDDefaultMulti.args,
  isOrigin: false
}
