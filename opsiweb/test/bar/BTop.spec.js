// export default class CTop extends Vue {
//   @Prop({ default: { visible: true, expanded: false } }) readonly attributes!: Object
import { createLocalVue, mount } from '@vue/test-utils'
import BootstrapVue, { BootstrapVueIcons } from 'bootstrap-vue'
import BTop from '@/components/bar/BTop'
// import IExpert from '@/components/icon/IExpert'
// import DropdownDDLang from '@/components/dropdown/DDLang'
// import DropdownDDTheme from '@/components/dropdown/DDTheme'
// import ButtonBTNLogout from '@/components/button/BTNLogout'

// create an extended `Vue` constructor
const localVue = createLocalVue()

// install plugins as normal
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BTop', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(BTop, {
      localVue, // router,
      mocks: {
        'require.context': () => { return {} },
        // require: { context: () => { return {} } },
        $i18n: { locale: '' },
        $mq: 'desktop',
        $t: () => 'some specific text'
      },
      stubs: ['IconIExpert', 'DropdownDDLang', 'DropdownDDTheme', 'ButtonBTNLogout'],
      // stubs: { IExpert, DropdownDDLang, DropdownDDTheme, ButtonBTNLogout },
      propsData: {
        attributes: { visible: true, expanded: false }
      }
    })
    expect(wrapper.vm).toBeTruthy()
  })
})
