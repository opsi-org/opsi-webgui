import { createLocalVue, mount } from '@vue/test-utils'
import BootstrapVue, { BootstrapVueIcons } from 'bootstrap-vue'
import BTooltipCollapseRow from '@/components/bar/BTooltipCollapseRow'
// create an extended `Vue` constructor
const localVue = createLocalVue()

// install plugins as normal
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BTooltipCollapseRow', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(BTooltipCollapseRow, {
      localVue, // router,
      mocks: {
        $mq: 'desktop',
        $t: () => 'some specific text'
      },
      propsData: {
        title: '',
        value: ''
        // valueVariant: 'info',
        // collapseable: true,
        // collapsed: false,
      }
    })
    expect(wrapper.vm).toBeTruthy()
  })
})
