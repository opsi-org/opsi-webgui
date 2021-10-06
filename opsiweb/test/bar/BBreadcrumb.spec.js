import { mount, createLocalVue } from '@vue/test-utils'
import BootstrapVue, { BootstrapVueIcons } from 'bootstrap-vue'
import VueRouter from 'vue-router'
import BBreadcrumbRow from '@/components/bar/BBreadcrumb'
// create an extended `Vue` constructor
const localVue = createLocalVue()

// install plugins as normal
localVue.use(VueRouter)
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)
const router = new VueRouter()
describe('BBreadcrumb', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(BBreadcrumbRow, { localVue, router })
    expect(wrapper.vm).toBeTruthy()
  })
})
