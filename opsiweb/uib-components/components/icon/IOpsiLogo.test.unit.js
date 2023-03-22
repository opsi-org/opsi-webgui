const BootstrapVue = require('bootstrap-vue').BootstrapVue
const BootstrapVueIcons = require('bootstrap-vue').BootstrapVueIcons
const createLocalVue = require('@vue/test-utils').createLocalVue
const mount = require('@vue/test-utils').mount
const OpsiLogo = require('./IOpsiLogo').default
const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('OpsiLogo', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(OpsiLogo, {
      localVue,
      mocks: {
        $mq: 'desktop',
        $t: () => 'some specific text'
      }
    })
  })

  it('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
