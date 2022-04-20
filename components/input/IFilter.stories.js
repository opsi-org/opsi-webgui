// import { withMock, mockBackendCall } from '.utils/storybook/mock'

export default {
  title: 'Input/I Filter',
  parameters: { docs: { description: { component: 'Input for filter' } } }
  // decorator: [withMock]
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<InputIFilter :data="args.tableInfo" :additional-title="args.title" />'
  // template: '<InputIFilter :data="$props.data" :additional-title="$props.additionalTitle" :data-changing="$props.dataChanging"/>'
})

// named export Primary to create respective story
export const IFilter = PrimaryTemplate.bind({})
IFilter.args = {
  title: 'title',
  tableInfo: {
    filterQuery: '',
    // sortBy: 'a',
    // sortDesc: false,
    headerData: {
      sel: { label: 'sel', key: 'sel', visible: true, sortable: true, _fixed: true },
      a: { label: 'A', key: 'a', visible: true, sortable: true },
      b: { label: 'B', key: 'b', visible: false, sortable: true },
      c: { key: 'c', label: 'C', visible: false, sortable: true, _fixed: false },
      _M: { label: 'M', key: '_M', _isMajor: true, visible: false },
      m1: { label: 'm1', key: 'm1', _majorKey: '_M', visible: true, sortable: true },
      m2: { label: 'm2', key: 'm2', _majorKey: '_M', visible: true, sortable: true },
      z: { key: 'z', label: 'Z', visible: true, _fixed: true }
    }
  }
}

// IFilter.parameters = {
//   mockData: [
//     mockBackendCall(
//       'opsidata/products/id/dependencies?selectedClients=[]&selectedDepots=[]',
//       { result: 'result to return' },
//       'GET',
//       '200'
//     )
//   ]
// }
