const BootstrapVue = require('bootstrap-vue').BootstrapVue
const BootstrapVueIcons = require('bootstrap-vue').BootstrapVueIcons
const createLocalVue = require('@vue/test-utils').createLocalVue
const mount = require('@vue/test-utils').mount
const BTop = require('./BTop.vue')

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BTop', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BTop, {
      localVue,
      mocks: {
        $i18n: { locale: '' },
        $mq: 'desktop',
        $t: () => 'some specific text',
        $config: { packageVersion: 'x.x' }
      },
      stubs: ['DropdownDDLang', 'DropdownDDTheme', 'ButtonBTNLogout', 'ModalMTrackChanges'],
      propsData: {
        attributes: { visible: true, expanded: false }
      }
    })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
