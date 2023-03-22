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

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<IconIDetails v-bind="args" />'
})

export const IDetailsOutdated = PrimaryTemplate.bind({})
IDetailsOutdated.args = {
  text: '≠',
  content: 'client-outdated',
  variant: 'danger'
}

export const IDetailsServerEqual = PrimaryTemplate.bind({})
IDetailsServerEqual.args = {
  text: '=',
  content: 'depot-unequal',
  variant: 'warning'
}

export const IDetailsServerUnEqual = PrimaryTemplate.bind({})
IDetailsServerUnEqual.args = {
  text: '≠',
  content: 'depot-unequal',
  variant: 'warning'
}

export const IDetailsServerStar = PrimaryTemplate.bind({})
IDetailsServerStar.args = {
  text: '*',
  content: 'depot-unequal',
  variant: 'warning'
}

export const IDetailsClientUnequal = PrimaryTemplate.bind({})
IDetailsClientUnequal.args = {
  text: '≠',
  content: 'ppv-client-different',
  variant: 'warning'
}
