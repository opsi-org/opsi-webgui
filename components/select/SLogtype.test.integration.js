const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('select-logtype snapshot', async ({ page }) => {
  await callStoryId(page, 'select-s-logtype', 's-logtype')
  const component = await page.locator('[data-testid="SLogtype"]')
  expect(await component.screenshot()).toMatchSnapshot('select-logtype.png')
})
