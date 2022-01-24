export default {
  title: 'Icon/I Table Column',
  parameters: { docs: { description: { component: 'Icon for Table Column' } } }
}

const DefaultVisibleTemplateHead = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<IconITableColumn/>
  `
})
export const ITableColumn = DefaultVisibleTemplateHead.bind({})
