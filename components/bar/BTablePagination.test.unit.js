const BootstrapVue = require('bootstrap-vue').BootstrapVue
const BootstrapVueIcons = require('bootstrap-vue').BootstrapVueIcons
const createLocalVue = require('@vue/test-utils').createLocalVue
const mount = require('@vue/test-utils').mount
const BTablePagination = require('./BTablePagination').default

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BTablePagination', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BTablePagination, {
      localVue,
      // stubs: ['DCountdowntimer'],
      mocks: {
        $mq: 'desktop',
        $t: () => 'some specific text'
      },
      propsData: {
        totalRows: 1,
        tabledata: {
          pageNumber: 1,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          setPageNumber: () => {},
          perPage: 1,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          setPerPage: () => {},
          sortBy: '',
          sortDesc: '',
          filterQuery: '',
          type: '',
          selectedDepots: '',
          selectedClients: ''
        }
      }
    })
  })

  test('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
