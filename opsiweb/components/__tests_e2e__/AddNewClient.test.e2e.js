const { test } = require('@playwright/test')
// const { apiMock } = require('../../.utils/playwright/pw-api-mock')

test.describe('Client - Create New', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./clientsaddnew')
  })
  test.afterEach(async ({ page }) => {
    await page.close()
  })
  // test('Add Button Disabled', async ({ page }) => {
  //   const locator = page.locator('#signin')
  //   await expect(locator).toBeDisabled()
  // })

  test('create a new opsi client', async ({ page }) => {
    // TODO Check if Add button is disabled when no ID.
    // TODO Fillout complete form, click on RESET and check if it resets the form
    // TODO Check default domain name is from configserver
    // TODO Fillout complete form, click on ADD and expect alert, also check clients table and filter by newClients ID.
    // TODO: Check with already existing client ID and expect alert
  })
})
