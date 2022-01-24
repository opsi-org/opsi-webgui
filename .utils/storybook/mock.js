
const API_BASE_URL = 'https://localhost:4447/addons/webgui/api/opsidata/'

module.exports.API_BASE_URL = API_BASE_URL
module.exports.mockBackendCall = (path, response, method, status) => {
  return {
    url: API_BASE_URL + path,
    response: response || {},
    method: method || 'GET',
    status: status || 200
  }
}
