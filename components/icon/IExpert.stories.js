export default {
  title: 'Icon/I Expert',
  parameters: { docs: { description: { component: 'Icon Expert Mode' } } }
}

const DefaultVisibleTemplateHead = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<IconIExpert/>
  `
})
export const IExpert = DefaultVisibleTemplateHead.bind({})
