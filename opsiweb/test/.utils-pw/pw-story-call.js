const wait = function (ms, s) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.callStory = (page, path) => page.goto(`http://localhost:3003/${path}`)
module.exports.callStoryId = async (page, fullId, id) => {
  return page.goto(`http://localhost:3003/iframe.html?id=${fullId}--${id}&args=&viewMode=story'`)
  // return wait(1000, fullId)
}

