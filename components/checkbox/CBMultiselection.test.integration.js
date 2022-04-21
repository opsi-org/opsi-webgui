const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('checkbox cbmultiselection snapshot', async ({ page }) => {
  await callStoryId(page, 'checkbox-cb-multiselection', 'cb-multiselection')
  const component = await page.locator('.CBMultiselection')
  expect(await component.screenshot()).toMatchSnapshot('CBMultiselection.png')
})
