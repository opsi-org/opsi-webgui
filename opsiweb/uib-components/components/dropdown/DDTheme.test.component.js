const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('Theme dropdown', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-theme', 'dd-theme')
  const component = page.locator('[data-testid="DropdownDDTheme"]')
  expect(await component.screenshot()).toMatchSnapshot('DDTheme-menu.png')
})

test('Theme dropdown menu', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-theme', 'dd-theme')
  await page.click('[data-testid="DropdownDDTheme"]')
  const component = page.locator('[data-testid="DropdownDDTheme"] ul')
  expect(await component.screenshot()).toMatchSnapshot('DDTheme-content.png')
})
