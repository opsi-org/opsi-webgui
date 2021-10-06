import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import BootstrapVue, { BootstrapVueIcons } from 'bootstrap-vue'
import BAuthFooter from '@/components/bar/BAuthFooter'
import DropdownDDLang from '@/components/dropdown/DDLang'
// import DropdownDDTheme from '@/components/dropdown/DDTheme'
// import ButtonBTNLogout from '@/components/button/BTNLogout'
// create an extended `Vue` constructor
const localVue = createLocalVue()

// install plugins as normal
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BAuthFooter', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(BAuthFooter, {
      localVue, // router,
      stubs: ['DropdownDDLang'],
      // stubs: {
      //   DropdownDDLang: {
      //     mocks: {
      //       $i18n: { locale: '', messages: { de: {}, en: {} } },
      //     }
      //   }
      // },
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
    expect(wrapper.vm).toBeTruthy()
  })
})
