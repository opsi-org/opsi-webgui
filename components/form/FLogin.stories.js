
const { withMock, mockBackendCall } = require('../../.utils/storybook/mock') //

export default {
  title: 'Form/F Login',
  parameters: { docs: { description: { component: 'Form for Login' } } },
  decorators: [withMock]
}

const PrimaryTemplate = () => ({
  template: '<FormFLogin />'
})

// named export Primary to create respective story
export const FLogin = PrimaryTemplate.bind({})
FLogin.parameters = {
  mockData: [
    mockBackendCall(
      'user/opsiserver', // api-path
      { result: 'mydepot.uib.local' }, // this should be the response
      'GET', // request-method
      '200' // status
    )
    // mockBackendCall(...) // if there are multiple api requests
  ]
}
