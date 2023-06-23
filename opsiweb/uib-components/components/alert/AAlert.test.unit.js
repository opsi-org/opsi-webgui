const mount = require('@vue/test-utils').mount

const AAlert = require('./AAlert').default

describe('AAlert', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(AAlert)
  })
  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
