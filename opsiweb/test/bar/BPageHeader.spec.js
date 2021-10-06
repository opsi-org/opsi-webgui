import { createLocalVue, mount } from '@vue/test-utils'
import BootstrapVue, { BootstrapVueIcons } from 'bootstrap-vue'
import BPageHeader from '@/components/bar/BPageHeader'
// import VueRouter from 'vue-router'
// create an extended `Vue` constructor
const localVue = createLocalVue()

// install plugins as normal
// localVue.use(VueRouter)
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)
// const router = new VueRouter()

describe('BPageHeader', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(BPageHeader, {
      localVue, // router,
      propsData: {
        variant: 'transparent',
        bold: true,
        navbartype: 'true',
        collapsed: true,
        title: 'true',
        closeroute: 'true'
      }
    })
    expect(wrapper.vm).toBeTruthy()
  })
})
