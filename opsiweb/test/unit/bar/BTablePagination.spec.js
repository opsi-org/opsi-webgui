import { createLocalVue, mount } from '@vue/test-utils'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import BTablePagination from '@/components/bar/BTablePagination'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)

describe('BTablePagination', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(BTablePagination, {
      localVue,
      mocks: {
        $mq: 'desktop',
        $t: () => 'some specific text'
      },
      propsData: {
        totalRows: 1,
        tabledata: {
          pageNumber: 1,
          setPageNumber: () => {},
          perPage: 1,
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
