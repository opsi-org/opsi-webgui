import { createLocalVue, mount } from '@vue/test-utils'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import BTooltipCollapseRow from '@/components/bar/BTooltipCollapseRow'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BTooltipCollapseRow', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BTooltipCollapseRow, {
      localVue,
      mocks: {
        $mq: 'desktop',
        $t: () => 'some specific text'
      },
      propsData: {
        title: '',
        value: ''
        /* props with defaults: */
        // valueVariant: 'info',
        // collapseable: true,
        // collapsed: false,
      }
    })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
