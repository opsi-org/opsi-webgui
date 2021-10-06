import { createLocalVue, mount } from '@vue/test-utils'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import BPageHeader from '@/components/bar/BPageHeader'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BPageHeader', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BPageHeader, {
      localVue,
      propsData: {
        variant: 'transparent',
        bold: true,
        navbartype: 'true',
        collapsed: true,
        title: 'true',
        closeroute: 'true'
      }
    })
  })
  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
