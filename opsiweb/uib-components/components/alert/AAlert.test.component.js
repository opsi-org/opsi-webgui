// import callStoryId from '../../.utils/playwright/pw-story-call'
const { test, expect } = require('@playwright/test')
const callStoryId = require('../../.utils/playwright/pw-story-call').callStoryId
// const callStoryId = require('../../.utils/playwright/pw-story-call').callStoryId // does not work, cause playwright is not reading tsconfigfile
// const callStoryId = require('../../.utils/playwright/pw-story-call').callStoryId
// const { callStoryId } = require('.utils/playwright/pw-story-call').callStoryId

test('alert default snapshot', async ({ page }) => {
  await callStoryId(page, 'alert-a-alert', 'a-alert')
  const component = await page.locator('#root')
  // await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('AAlert.png')
  // await component.evaluate(() => { document.querySelector('.BAuthFooter-version').innerHTML = 'x.x.x' })
  // expect(await component.screenshot()).toMatchSnapshot('AAlert.png', { threshold: 0.1 })
  // expect(await component.screenshot()).toMatchSnapshot('AAlert.png', { maxDiffPixelRatio: 0.2 })
})
