const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('dropdown DDTheme snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-theme', 'dd-theme')
  const component = await page.locator('[data-testid="DropdownDDTheme"]')
  expect(await component.screenshot()).toMatchSnapshot('DDTheme-menu.png')
})

test('dropdown DDTheme content snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-theme', 'dd-theme')
  await page.click('[data-testid="DropdownDDTheme"] .btn')
  const component = await page.locator('[data-testid="DropdownDDTheme"] ul')
  expect(await component.screenshot()).toMatchSnapshot('DDTheme-content.png')
})
