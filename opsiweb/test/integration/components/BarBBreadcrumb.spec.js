const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('bar bbreadcrumb snapshot', async ({ page }) => {
  await callStoryId(page, 'bar-b-breadcrumb', 'b-breadcrumb')
  expect(await page.screenshot()).toMatchSnapshot('comp-bar-bbreadcrumb.png')
})
