// import callStoryId from '../../.utils/playwright/pw-story-call'
const { test, expect } = require('@playwright/test')
const callStoryId = require('../../.utils/playwright/pw-story-call').callStoryId
// const callStoryId = require('../../.utils/playwright/pw-story-call').callStoryId // does not work, cause playwright is not reading tsconfigfile
// const callStoryId = require('../../.utils/playwright/pw-story-call').callStoryId
// const { callStoryId } = require('.utils/playwright/pw-story-call').callStoryId

test('alertlocal default snapshot', async ({ page }) => {
  await callStoryId(page, 'alert-a-alert-local', 'a-alert-local')
  const component = await page.locator('#root')
  expect(await component.screenshot()).toMatchSnapshot('AAlertLocal.png')
})
