const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('tableCell installationStatus snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-installationstatus', 'tc-installation-status')
  const component = await page.locator('[data-testid="TCInstallationStatus"]')
  expect(await component.screenshot()).toMatchSnapshot('TCInstallationStatus.png')
})
