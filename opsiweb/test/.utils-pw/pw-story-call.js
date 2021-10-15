module.exports.callStory = (page, path) => page.goto(`http://localhost:3003/${path}`)
module.exports.callStoryId = (page, fullId, id) => page.goto(`http://localhost:3003/iframe.html?id=${fullId}--${id}&args=&viewMode=story'`)

