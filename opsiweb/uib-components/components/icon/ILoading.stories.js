export default {
  title: 'Icon/I Loading',
  parameters: { docs: { description: { component: 'Icon for Loading Status' } } }
}

const DefaultVisibleTemplateHead = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<IconILoading/>
  `
})
export const ILoading = DefaultVisibleTemplateHead.bind({})
