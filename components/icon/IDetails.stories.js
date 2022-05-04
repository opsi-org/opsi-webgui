export default {
  title: 'Icon/I Details',
  parameters: { docs: { description: { component: 'Icon for Details' } } }
}

const DefaultVisibleTemplateHead = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<div data-testid="IDetails-All">
  depot version different <IconIDetails content="depot-unequal"/>
  >= 1 depot doesnt have product <IconIDetails content="depot-wo-prod"/>
  client outdated <IconIDetails content="client-outdated"/>
  pp-value different for clients <IconIDetails content="ppv-client-different"/>
  pp not on every depot <IconIDetails content="ppid-not-exists-on-depot"/>
  just unequal <IconIDetails content="unequal"/>
  something else <IconIDetails content="something else"/>
  </div>
  `
})

export const IDetails = DefaultVisibleTemplateHead.bind({})
