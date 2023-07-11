const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('modal-product actions snapshot', async ({ page }) => {
  await callStoryId(page, 'modal-m-productactions', 'm-productactions')
  const component = await page.locator('[data-testid="MProdActions"]')
  expect(await component.screenshot()).toMatchSnapshot('MProdActions.png')
})
