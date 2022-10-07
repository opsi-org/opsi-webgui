const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-depots snapshot', async ({ page }) => {
  await callStoryId(page, 'view-v-depots', 'v-depots')
  const component = await page.locator('[data-testid="VDepots"]')
  expect(await component.screenshot()).toMatchSnapshot('VDepots-table.png')
})

test('view-depots snapshot contextmenu', async ({ page }) => {
  await callStoryId(page, 'view-v-depots', 'v-depots')
  let component = await page.locator('[data-testid="VDepots"]')
  await component.locator('tbody > tr[aria-rowindex="1"]').click({ button: 'right' })
  component = await page.locator('#right-click-menu')
  expect(await component.screenshot()).toMatchSnapshot('VDepots-contextmenu.png')
})
