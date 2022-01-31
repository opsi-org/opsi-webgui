/**
 * @module mockmodule for storybook
 */

// import withMock from 'storybook-addon-mock'
const withMock = require('storybook-addon-mock').default
const API_BASE_URL = 'https://localhost:4447/addons/webgui/api/'
console.log("withMockAddon ", withMock)


module.exports.API_BASE_URL = API_BASE_URL

/**
 * withMock decorator from storybook-addon-mock.
 *
 * Usage in story:
 * ```
 * export default {
 *   ...
 *   decorators: [withMock]
 * }
 * ```
 */
module.exports.withMock = (storyFn) =>  withMock(storyFn)

/**
 * Method for mocking data.
 *
 * Usage in story:
 * ```
 * export const Component = PrimaryTemplate.bind({})
 * Component.parameters = {
 *   mockData: [
 *     mockBackendCall(
 *       'opsidata/products/id/dependencies?selectedClients=[]&selectedDepots=[]',
 *       { result: 'result to return' },
 *       'GET',
 *       '200'
 * ), ... ]}
 * ```
 * @param {String} path relative  url with should be mocked
 * @param {any} response (default: empty object)
 * @param {String} method GET, POST, ... (default: GET)
 * @param {String} status HTTP-Status to return (default: 200)
 * @returns
 */
module.exports.mockBackendCall = (path, response, method, status) => {
  return {
    url: API_BASE_URL + path,
    response: response || {},
    method: method || 'GET',
    status: status || 200
  }
}
