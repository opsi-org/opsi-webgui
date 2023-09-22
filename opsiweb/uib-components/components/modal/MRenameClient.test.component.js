const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('snapshot > client rename', async ({ page }) => {
  await callStoryId(page, 'modal-m-rename-client', 'm-rename-client')
  const component = page.locator('[data-testid="MRenameClient"]')
  expect(await component.screenshot()).toMatchSnapshot('MRenameClient.png')
})
