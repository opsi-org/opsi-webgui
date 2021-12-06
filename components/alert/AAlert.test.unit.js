// const createLocalVue = require('@vue/test-utils').createLocalVue
const mount = require('@vue/test-utils').mount
// const describe = require('@vue/test-utils').describe
// const beforeEach = require('@vue/test-utils').beforeEach
// const expect = require('@vue/test-utils').expect
// const test = require('@vue/test-utils').test
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
