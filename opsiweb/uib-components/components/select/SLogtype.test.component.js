const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('logtype selection', async ({ page }) => {
  await callStoryId(page, 'select-s-logtype', 's-logtype')
  const component = page.locator('[data-testid="SLogtype"]')
  expect(await component.screenshot()).toMatchSnapshot('SLogtype.png')
})
