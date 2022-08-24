const BootstrapVue = require('bootstrap-vue').BootstrapVue
const BootstrapVueIcons = require('bootstrap-vue').BootstrapVueIcons
const createLocalVue = require('@vue/test-utils').createLocalVue
const mount = require('@vue/test-utils').mount
const BSide = require('./BSide').default

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BSide', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(BSide, {
      localVue,
      mocks: {
        $mq: 'desktop',
        $t: () => 'some specific text'
      },
      stubs: ['NavNSidebar', 'DivDCountdowntimer'],
      propsData: {
        attributes: {
          expanded: true,
          visible: true,
          alwaysVisible: true
        }
      }
    })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
