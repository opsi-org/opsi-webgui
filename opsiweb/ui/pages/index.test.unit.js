// import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
const BootstrapVue = require('bootstrap-vue').BootstrapVue
const BootstrapVueIcons = require('bootstrap-vue').BootstrapVueIcons

const mount = require('@vue/test-utils').mount
const createLocalVue = require('@vue/test-utils').createLocalVue
const PIndex = require('~/pages').default

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('PIndex', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(PIndex, {
      localVue,
      stubs: ['IconIOpsiLogo']
      // stubs: ['DropdownDDLang', 'IconIOpsiLogo'],
      // mocks: {
      //   $i18n: { locale: '', messages: { de: {}, en: {} } },
      //   $config: { packageVersion: '0' },
      //   $mq: 'desktop',
      //   $t: () => 'some specific text'
      // },
      // propsData: {
      //   attributes: { visible: true, expanded: false }
      // }
    })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
