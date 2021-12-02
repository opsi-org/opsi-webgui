const BootstrapVue = require('bootstrap-vue').BootstrapVue
const BootstrapVueIcons = require('bootstrap-vue').BootstrapVueIcons
const createLocalVue = require('@vue/test-utils').createLocalVue
const mount = require('@vue/test-utils').mount
const BPageHeader = require('@/bar/BPageHeader').default

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BPageHeader', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BPageHeader, {
      localVue,
      propsData: {
        variant: 'transparent',
        bold: true,
        navbartype: 'true',
        collapsed: true,
        title: 'true',
        closeroute: 'true'
      }
    })
  })
  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
