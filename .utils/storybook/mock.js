// import withMock from 'storybook-addon-mock'
const withMock = require('storybook-addon-mock').default
const API_BASE_URL = 'https://localhost:4447/addons/webgui/api/'
console.log("withMockAddon ", withMock)

// const myMock = () => {
//   console.log("withMockAddon ", withMock)
//   return withMock
// }
module.exports.API_BASE_URL = API_BASE_URL
module.exports.withMock = withMock
module.exports.mockBackendCall = (path, response, method, status) => {
  return {
    url: API_BASE_URL + path,
    response: response || {},
    method: method || 'GET',
    status: status || 200
  }
}
