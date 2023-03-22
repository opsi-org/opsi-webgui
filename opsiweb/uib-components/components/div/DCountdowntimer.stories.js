import { store } from '../../.utils/storybook/mock'
// import { mock } from '../../.utils/storybook/mock'
// import { Store } from 'vuex'
// const result = { result: '<config-server-id>' }
// mock.onGet('/api/user/opsiserver').reply(200, result)

export default {
  title: 'Div/D Counttimer',
  parameters: { docs: { description: { component: 'Div/DCounttimer description' } } }
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
  // store: store({ authentication: { enabled: true, durationMin: 2 } })
  store: store({ enable_auth: true })
})

export const DCounttimer = DefaultVisibleTemplate.bind({})
DCounttimer.args = { small: false }
export const DCounttimerAuth = DefaultAuthVisibleTemplate.bind({})
DCounttimerAuth.args = { small: false }

// cookie.set('opsiconf-session')
export const DCounttimerSmall = DefaultVisibleTemplate.bind({})
DCounttimerSmall.args = { small: true }
export const DCounttimerAuthSmall = DefaultAuthVisibleTemplate.bind({})
DCounttimerAuthSmall.args = { small: true }
