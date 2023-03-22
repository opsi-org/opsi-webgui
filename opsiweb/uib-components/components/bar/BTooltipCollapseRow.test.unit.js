const BootstrapVue = require('bootstrap-vue').BootstrapVue
const BootstrapVueIcons = require('bootstrap-vue').BootstrapVueIcons
const createLocalVue = require('@vue/test-utils').createLocalVue
const mount = require('@vue/test-utils').mount
const BTooltipCollapseRow = require('./BTooltipCollapseRow').default

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BTooltipCollapseRow', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BTooltipCollapseRow, {
      localVue,
      mocks: {
        $mq: 'desktop',
        $t: () => 'some specific text'
      },
      propsData: {
        title: '',
        value: ''
        /* props with defaults: */
        // valueVariant: 'info',
        // collapseable: true,
        // collapsed: false,
      }
    })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
