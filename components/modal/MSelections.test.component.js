const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('modal-selections snapshot', async ({ page }) => {
  await callStoryId(page, 'modal-m-selections', 'm-selections')
  const component = await page.locator('[data-testid="MSelections"]')
  expect(await component.screenshot()).toMatchSnapshot('MSelections.png')
})
