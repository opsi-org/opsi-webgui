const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('installationStatus unknown', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-installation-status', 'tc-installation-status-unknown')
  const component = page.locator('[data-testid="TCInstallationStatus"]')
  expect(await component.screenshot()).toMatchSnapshot('TCInstallationStatus-unknown.png')
})

test('installationStatus installed', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-installation-status', 'tc-installation-status-installed')
  const component = page.locator('[data-testid="TCInstallationStatus"]')
  expect(await component.screenshot()).toMatchSnapshot('TCInstallationStatus-installed.png')
})

test('installationStatus danger', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-installation-status', 'tc-installation-status-danger')
  const component = page.locator('[data-testid="TCInstallationStatus"]')
  expect(await component.screenshot()).toMatchSnapshot('TCInstallationStatus-danger.png')
})
