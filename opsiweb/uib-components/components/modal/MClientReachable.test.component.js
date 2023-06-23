const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('client reachability modal', async ({ page }) => {
  await callStoryId(page, 'modal-m-clientreachable', 'm-clientreachable')
  const component = page.locator('[data-testid="MClientreachable"]')
  expect(await component.screenshot()).toMatchSnapshot('MClientreachable.png')
})
