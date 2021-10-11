import { createLocalVue, mount } from '@vue/test-utils'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import BAuthFooter from '@/components/bar/BAuthFooter'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BAuthFooter', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BAuthFooter, {
      localVue,
      stubs: ['DropdownDDLang'],
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
