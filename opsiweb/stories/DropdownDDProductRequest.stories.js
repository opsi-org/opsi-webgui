export default {
  title: 'Dropdown/DD Product Request',
  parameters: { docs: { description: { component: 'Dropdown/DDProductRequest description' } } }
}

const DefaultVisibleTemplateHead = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<DropdownDDProductRequest
  :action.sync="$props.action"
  :save="() => {}"
  />
  `
})
export const DDProductRequestHead = DefaultVisibleTemplateHead.bind({})
DDProductRequestHead.args = { action: 'setup' }

const DefaultVisibleTemplateCell = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<DropdownDDProductRequest
  :request="$props.action"
  :requestoptions="$props.actions"
  :save="() => {}"
  />
  `
  // :rowitem="row.item"
})
export const DDProductRequestCell = DefaultVisibleTemplateCell.bind({})
DDProductRequestCell.args = { action: 'setup', actions: ['setup', 'none', 'uninstall'] }
