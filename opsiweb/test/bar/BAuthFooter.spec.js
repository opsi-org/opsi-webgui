import { createLocalVue, mount } from '@vue/test-utils'
import BootstrapVue, { BootstrapVueIcons } from 'bootstrap-vue'
import BAuthFooter from '@/components/bar/BAuthFooter'
// create an extended `Vue` constructor
const localVue = createLocalVue()

// install plugins as normal
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BAuthFooter', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(BAuthFooter, {
      localVue, // router,
      mocks: {
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
