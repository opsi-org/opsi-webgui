const BootstrapVue = require('bootstrap-vue').BootstrapVue
const BootstrapVueIcons = require('bootstrap-vue').BootstrapVueIcons
const createLocalVue = require('@vue/test-utils').createLocalVue
const mount = require('@vue/test-utils').mount
const BAuthFooter = require('./BAuthFooter').default
// const DCountdowntimer = require('../div/DCountdowntimer').default
// tzesz
const localVue = createLocalVue()
localVue.use(BootstrapVue)

localVue.use(BootstrapVueIcons)

describe('BAuthFooter', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BAuthFooter, {
      localVue,
      stubs: ['DropdownDDLang', 'DCountdowntimer'],
      mocks: {
        $i18n: { locale: '', messages: { de: {}, en: {} } },
        $config: { packageVersion: '0' },
        $mq: 'desktop',
        $t: () => 'some specific text'
      },
      propsData: {
        attributes: { visible: true, expanded: false }
      }
    })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
