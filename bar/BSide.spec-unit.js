import { createLocalVue, mount } from '@vue/test-utils'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import BSide from '@/components/bar/BSide'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BSide', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(BSide, {
      localVue,
      mocks: {
        $mq: 'desktop',
        $t: () => 'some specific text'
      },
      stubs: ['NavNSidebar'],
      propsData: {
        attributes: {
          expanded: true,
          visible: true
        }
      }
    })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
