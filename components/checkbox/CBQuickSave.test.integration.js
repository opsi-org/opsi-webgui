const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button quick save snapshot', async ({ page }) => {
  await callStoryId(page, 'checkbox-c-b-quick-save', 'cb-quick-save')
  const component = await page.locator('[data-testid="CBQuickSave"]')
  expect(await component.screenshot()).toMatchSnapshot('CBQuickSave.png')
})
// TODO: Test clicking.
// test('button quick save true snapshot', async ({ page }) => {
//   await callStoryId(page, 'checkbox-c-b-quick-save', 'cb-quick-save')
//   await page.click('[data-testid="CBQuickSave"]')
//   // const component = await page.locator('[data-testid="CBQuickSave"]')
//   // await component.click()
//   expect(await page.screenshot()).toMatchSnapshot('CBQuickSave-true.png', { threshold: 0.2 })
// })
