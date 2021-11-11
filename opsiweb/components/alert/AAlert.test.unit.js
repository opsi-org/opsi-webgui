import { mount } from '@vue/test-utils'
import AAlert from '@/components/alert/AAlert'

describe('AAlert', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(AAlert)
  })
  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
