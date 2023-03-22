export default {
  title: 'Icon/I Loading',
  parameters: { docs: { description: { component: 'Loading Icon' } } }
}

const DefaultVisibleTemplateHead = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<IconILoading/>
  `
})
export const ILoading = DefaultVisibleTemplateHead.bind({})
