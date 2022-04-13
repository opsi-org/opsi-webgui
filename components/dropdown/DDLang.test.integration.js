const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('dropdown lang snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  const component = await page.locator('[data-testid="DropdownDDLang"]')
  expect(await component.screenshot()).toMatchSnapshot('DDLang-normal.png')
})

test('dropdown lang opened snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  await page.click('[data-testid="DropdownDDLang"]')
  const component = await page.locator('[data-testid="DropdownDDLang"] > ul')
  expect(await component.screenshot()).toMatchSnapshot('DDLang-opened.png')
})

test('dropdown lang changed snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  await page.click('[data-testid="DropdownDDLang"]')
  await page.click('[data-testid="DropdownDDLang-Item-de"]')
  const component = await page.locator('[data-testid="DropdownDDLang"]')
  expect(await component.screenshot()).toMatchSnapshot('DDLang-changed.png')
})
