const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-groups', async ({ page }) => {
  await callStoryId(page, 'view-v-groups', 'v-groups')
  const component = page.locator('[data-testid="VGroups"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await component.screenshot()).toMatchSnapshot('VGroups.png')
})
