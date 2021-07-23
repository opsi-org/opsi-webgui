import { mount } from '@vue/test-utils'
import OpsiLogo from '~/components/icon/IOpsiLogo.vue'

describe('OpsiLogo', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(OpsiLogo)
    expect(wrapper.vm).toBeTruthy()
  })
})
