const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('tableCell installationStatus unknown snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-installation-status', 'tc-installation-status-unknown')
  const component = await page.locator('[data-testid="TCInstallationStatus"]')
  expect(await component.screenshot()).toMatchSnapshot('TCInstallationStatus-unknown.png')
})

test('tableCell installationStatus installed snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-installation-status', 'tc-installation-status-installed')
  const component = await page.locator('[data-testid="TCInstallationStatus"]')
  expect(await component.screenshot()).toMatchSnapshot('TCInstallationStatus-installed.png')
})

test('tableCell installationStatus danger snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-installation-status', 'tc-installation-status-danger')
  const component = await page.locator('[data-testid="TCInstallationStatus"]')
  expect(await component.screenshot()).toMatchSnapshot('TCInstallationStatus-danger.png')
})
