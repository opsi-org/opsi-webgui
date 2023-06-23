import { store } from '../../.utils/storybook/mock'

export default {
  title: 'Div/D Counttimer',
  parameters: { docs: { description: { component: 'Session Countdown Timer' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: `<DivDCountdowntimer :small="args.small" />
  `
})
const DefaultAuthVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<DivDCountdowntimer :small="args.small"/>',
  store: store({ enable_auth: true })
})

export const DCounttimer = DefaultVisibleTemplate.bind({})
DCounttimer.args = { small: false }
export const DCounttimerAuth = DefaultAuthVisibleTemplate.bind({})
DCounttimerAuth.args = { small: false }

export const DCounttimerSmall = DefaultVisibleTemplate.bind({})
DCounttimerSmall.args = { small: true }
export const DCounttimerAuthSmall = DefaultAuthVisibleTemplate.bind({})
DCounttimerAuthSmall.args = { small: true }
