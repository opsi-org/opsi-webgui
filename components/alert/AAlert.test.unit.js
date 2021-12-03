// const createLocalVue = require('@vue/test-utils').createLocalVue
const mount = require('@vue/test-utils').mount
const AAlert = require('@/alert/AAlert').default

describe('AAlert', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(AAlert)
  })
  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
