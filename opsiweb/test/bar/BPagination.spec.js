
// @Prop({}) tabledata!:ITableData;

import { createLocalVue, mount } from '@vue/test-utils'
import BootstrapVue, { BootstrapVueIcons } from 'bootstrap-vue'
// import VueI18n from 'vue-i18n'
import BPaginationUib from '@/components/bar/BPagination'
// import VueRouter from 'vue-router'
// create an extended `Vue` constructor
const localVue = createLocalVue()

// install plugins as normal
// localVue.use(VueRouter)
localVue.use(BootstrapVue)
localVue.use(BootstrapVueIcons)
// localVue.use(VueI18n)
// const router = new VueRouter()

describe('BPagination', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(BPaginationUib, {
      localVue, // router,
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
    expect(wrapper.vm).toBeTruthy()
  })
})
