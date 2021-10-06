import { createLocalVue, mount } from '@vue/test-utils'
import BootstrapVue, { BootstrapVueIcons } from 'bootstrap-vue'
import BSide from '@/components/bar/BSide'
// create an extended `Vue` constructor
const localVue = createLocalVue()

// install plugins as normal
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BSide', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(BSide, {
      localVue, // router,
      mocks: {
        $mq: 'desktop',
        $t: () => 'some specific text'
      },
      propsData: {
        attributes: {
          expanded: true,
          visible: true
        }
      }
    })
    expect(wrapper.vm).toBeTruthy()
  })
})
