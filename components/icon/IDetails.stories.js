export default {
  title: 'Icon/I Details',
  parameters: { docs: { description: { component: 'Icon for Details' } } }
}

const DefaultVisibleTemplateHead = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<IconIDetails/>
  `
})
export const IDetails = DefaultVisibleTemplateHead.bind({})
