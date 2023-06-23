export default {
  title: 'Dropdown/DD Product Request',
  parameters: { docs: { description: { component: 'Dropdown for Product Action Request' } } }
}

const DefaultVisibleTemplateHead = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: `<b-badge variant="transparent"><DropdownDDProductRequest
  :action.sync="args.action"
  :save="() => {}"
  /></b-badge>
  `
})
export const DDProductRequestHead = DefaultVisibleTemplateHead.bind({})
DDProductRequestHead.args = { action: 'setup' }

const DefaultVisibleTemplateCell = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: `<DropdownDDProductRequest
  :request="args.action"
  :requestoptions="args.actions"
  :save="() => {}"
  />
  `
  // :rowitem="row.item"
})
export const DDProductRequestCell = DefaultVisibleTemplateCell.bind({})
DDProductRequestCell.args = { action: 'setup', actions: ['setup', 'none', 'uninstall'] }
