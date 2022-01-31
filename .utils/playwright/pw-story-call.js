// const wait = function (ms, s) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

const apiMock = (page, apiPath, response) => page.route(apiPath, route => route.fulfill({
  status: 200,
  headers: {
    'access-control-allow-origin': 'https://localhost:8888',
    'access-control-allow-credentials': true,
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*'
  },
  contentType: 'application/json',
  body: JSON.stringify(response)
}))

module.exports.callStoryIdMock = async (page, fullId, id, path, result) => {
  await this.callStoryId(page, fullId, id, path, result)
  await page.unroute(path)
  await apiMock(page, path, result)
}
module.exports.callStoryId = (page, fullId, id) => this.callStory(page, `iframe.html?id=${fullId}--${id}&args=&viewMode=story'`)
module.exports.callStory = (page, path) => page.goto(`http://localhost:3003/${path}`)
