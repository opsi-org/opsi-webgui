import { mount, createLocalVue } from '@vue/test-utils'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import VueRouter from 'vue-router'
import BBreadcrumbRow from '@/components/bar/BBreadcrumb'

const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

const router = new VueRouter()
describe('BBreadcrumb', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BBreadcrumbRow, { localVue, router })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
