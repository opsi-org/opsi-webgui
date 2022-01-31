// import { withMock, mockBackendCall} from '.utils/storybook/mock'

export default {
  title: 'Input/I Filter',
  parameters: { docs: { description: { component: 'Input for filter' } } }
  // decorator: [withMock]
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<InputIFilter :data="$props.data" :additional-title="$props.additionalTitle" :data-changing="$props.dataChanging"/>'
})

// named export Primary to create respective story
export const IFilter = PrimaryTemplate.bind({})
IFilter.args = {
  dataChanging: 'string',
  additionalTitle: '',
  data: {
    pageNumber: 0,
    setPageNumber: () => {},
    perPage: 0,
    setPerPage: () => {},
    sortBy: 'string',
    sortDesc: false,
    filterQuery: '<filter-string>',
    type: 'string',
    selectedDepots: 'string',
    selectedClients: 'string'
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
