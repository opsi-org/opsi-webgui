const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-v-admimaintenance', async ({ page }) => {
  await callStoryId(page, 'view-v-admimaintenance', 'v-admin-maintenance')
  const component = page.locator('[data-testid="VAdminMaintenance"]')
  expect(await component.screenshot()).toMatchSnapshot('VAdminMaintenance.png')
})
