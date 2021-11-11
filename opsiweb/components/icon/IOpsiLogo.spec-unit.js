import { mount } from '@vue/test-utils'
// import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import OpsiLogo from '~/components/icon/IOpsiLogo.vue'
// const localVue = createLocalVue()
// localVue.use(BootstrapVue)
// localVue.use(BootstrapVueIcons)

describe('OpsiLogo', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(OpsiLogo)
  })

  it('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
