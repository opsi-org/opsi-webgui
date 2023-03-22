export default {
  title: 'Icon/I Opsi Logo',
  parameters: { docs: { description: { component: 'Icon/IOpsiLogo description' } } }
}

const DefaultVisibleTemplateHead = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<div data-testid="IconIOpsiLogo-all">
    <IconIOpsiLogo style="background-color: black" :light="true"/>
    <IconIOpsiLogo style="background-color: black" :light="false"/>
  </div>
  `
})
export const IOpsiLogo = DefaultVisibleTemplateHead.bind({})
