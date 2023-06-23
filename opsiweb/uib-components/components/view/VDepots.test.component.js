const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('view-depots', async ({ page }) => {
  await callStoryId(page, 'view-v-depots', 'v-depots')
  const component = page.locator('[data-testid="VDepots"]')
  expect(await component.screenshot()).toMatchSnapshot('VDepots-table.png')
})

test('view-depots with opened contextmenu', async ({ page }) => {
  await callStoryId(page, 'view-v-depots', 'v-depots')
  const component = page.locator('[data-testid="VDepots"]')
  await component.locator('tbody > tr[aria-rowindex="1"]').click({ button: 'right' })
  page.locator('#right-click-menu')
  expect(await component.screenshot()).toMatchSnapshot('VDepots-contextmenu.png')
})
