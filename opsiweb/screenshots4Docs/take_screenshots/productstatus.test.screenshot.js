const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test.describe('Product status ', () => {
  test('unknown', async ({ page }) => {
    await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-unknown')
    const component = await page.locator('[data-testid="TCActionResultBadge"]')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_unknown.png' })
    await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_unknown.png' })
  })
  test('installed', async ({ page }) => {
    await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-installed')
    const component = await page.locator('[data-testid="TCActionResultBadge"]')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_installed.png' })
    await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_installed.png' })
  })
  test('successful', async ({ page }) => {
    await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-success')
    const component = await page.locator('[data-testid="TCActionResultBadge"]')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_successful.png' })
    await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_successful.png' })
  })
  test('failed', async ({ page }) => {
    await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-failed')
    const component = await page.locator('[data-testid="TCActionResultBadge"]')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_failed.png' })
    await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_failed.png' })
  })
  test.describe('Unqual', () => {
    test('Warning', async ({ page }) => {
      await callStoryId(page, 'tablecell-t-c-installation-status', 'tc-installation-status-unknown')
      const component = await page.locator('[data-testid="TCInstallationStatusBadge"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_unequal_warning.png' })
      await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_unequal_warning.png' })
    })
    test('Success', async ({ page }) => {
      await callStoryId(page, 'tablecell-t-c-installation-status', 'tc-installation-status-installed')
      const component = await page.locator('[data-testid="TCInstallationStatusBadge"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_unequal_success.png' })
      await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_unequal_success.png' })
    })
    test('Danger', async ({ page }) => {
      await callStoryId(page, 'tablecell-t-c-installation-status', 'tc-installation-status-danger')
      const component = await page.locator('[data-testid="TCInstallationStatusBadge"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_unequal_danger.png' })
      await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_unequal_danger.png' })
    })
  })
  test.describe('Version', () => {
    test('Client Outdated', async ({ page }) => {
      await callStoryId(page, 'icon-i-details', 'i-details-outdated')
      const component = await page.locator('[data-testid="IDetailsBadge"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_version_clientoutdated.png' })
      await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_version_clientoutdated.png' })
    })
    test('Client Unqual', async ({ page }) => {
      await callStoryId(page, 'icon-i-details', 'i-details-client-unequal')
      const component = await page.locator('[data-testid="IDetailsBadge"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_version_clientunequal.png' })
      await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_version_clientunequal.png' })
    })
    test('Server Equal', async ({ page }) => {
      await callStoryId(page, 'icon-i-details', 'i-details-server-equal')
      const component = await page.locator('[data-testid="IDetailsBadge"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_version_server_equal.png' })
      await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_version_server_equal.png' })
    })
    test('Server UnEqual', async ({ page }) => {
      await callStoryId(page, 'icon-i-details', 'i-details-server-un-equal')
      const component = await page.locator('[data-testid="IDetailsBadge"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_version_server_unequal.png' })
      await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_version_server_unequal.png' })
    })
    test('Server Star', async ({ page }) => {
      await callStoryId(page, 'icon-i-details', 'i-details-server-star')
      const component = await page.locator('[data-testid="IDetailsBadge"]')
      await (new Promise(resolve => setTimeout(resolve, 1000)))
      await component.screenshot({ path: './screenshots/en/opsi-webgui_productstat_version_server_star.png' })
      await component.screenshot({ path: './screenshots/de/opsi-webgui_productstat_version_server_star.png' })
    })
  })
})
