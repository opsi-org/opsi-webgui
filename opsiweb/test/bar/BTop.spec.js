// export default class CTop extends Vue {
//   @Prop({ default: { visible: true, expanded: false } }) readonly attributes!: Object
import { createLocalVue, mount } from '@vue/test-utils'
import BootstrapVue, { BootstrapVueIcons } from 'bootstrap-vue'
import BTop from '@/components/bar/BTop'
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
