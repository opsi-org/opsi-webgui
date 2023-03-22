const BootstrapVue = require('bootstrap-vue').BootstrapVue
const BootstrapVueIcons = require('bootstrap-vue').BootstrapVueIcons
const createLocalVue = require('@vue/test-utils').createLocalVue
const mount = require('@vue/test-utils').mount
const VueRouter = require('vue-router')
const BBreadcrumbRow = require('./BBreadcrumbRow').default

const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

const router = new VueRouter()
describe('BBreadcrumbRow', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BBreadcrumbRow, { localVue, router })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
