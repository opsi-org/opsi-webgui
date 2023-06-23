const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('host parameter changes', async ({ page }) => {
  await callStoryId(page, 'grid-g-changes-host-param', 'g-changes-host-param')
  const component = page.locator('[data-testid="GChangesHostParam"]')
  expect(await component.screenshot()).toMatchSnapshot('GChangesHostParam.png')
})
