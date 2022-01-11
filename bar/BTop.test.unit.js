import { createLocalVue, mount } from '@vue/test-utils'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import BTop from '@/components/bar/BTop'

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
        $config: ''
      },
      stubs: ['IconIExpert', 'DropdownDDLang', 'DropdownDDTheme', 'ButtonBTNLogout'],
      propsData: {
        attributes: { visible: true, expanded: false }
      }
    })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
