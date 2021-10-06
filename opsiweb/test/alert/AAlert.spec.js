import { mount } from '@vue/test-utils'
import AAlert from '@/components/alert/AAlert'

describe('AAlert', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(AAlert)
    expect(wrapper.vm).toBeTruthy()
  })
})
