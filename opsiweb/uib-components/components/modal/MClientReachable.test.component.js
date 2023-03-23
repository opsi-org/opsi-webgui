const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('modal-clientreachability snapshot', async ({ page }) => {
  await callStoryId(page, 'modal-m-clientreachable', 'm-clientreachable')
  const component = await page.locator('[data-testid="MClientreachable"]')
  expect(await component.screenshot()).toMatchSnapshot('MClientreachable.png')
})
