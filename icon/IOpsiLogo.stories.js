export default {
  title: 'Icon/I Opsi Logo',
  parameters: { docs: { description: { component: 'Icon/IOpsiLogo description' } } }
}

const DefaultVisibleTemplateHead = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<IconIOpsiLogo/>
  `
})
export const IOpsiLogo = DefaultVisibleTemplateHead.bind({})
