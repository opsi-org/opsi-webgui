import { store } from '../../.utils/storybook/mock'
// import { mock } from '../../.utils/storybook/mock'
// import { Store } from 'vuex'
// const result = { result: '<config-server-id>' }
// mock.onGet('/api/user/opsiserver').reply(200, result)

export default {
  title: 'Div/D Counttimer',
  parameters: { docs: { description: { component: 'Div/DCounttimer description' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<DivDCountdowntimer :small="$props.small" />
  `
})
const DefaultAuthVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<DivDCountdowntimer :small="$props.small"/>',
  // store: store({ authentication: { enabled: true, durationMin: 2 } })
  store: store({ enable_auth: true })
})

export const DCounttimer = DefaultVisibleTemplate.bind({})
DCounttimer.args = { small: false }

// cookie.set('opsiconf-session')
export const DCounttimerSmall = DefaultVisibleTemplate.bind({})
DCounttimerSmall.args = { small: true }

export const DCounttimerAuth = DefaultAuthVisibleTemplate.bind({})
DCounttimerAuth.args = { small: false }
export const DCounttimerAuthSmall = DefaultAuthVisibleTemplate.bind({})
DCounttimerAuthSmall.args = { small: true }
