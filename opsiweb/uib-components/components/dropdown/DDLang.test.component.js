const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('language dropdown', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  const component = page.locator('[data-testid="DropdownDDLang"]')
  expect(await component.screenshot()).toMatchSnapshot('DDLang-normal.png', { maxDiffPixelRatio: 0.2 })
})

test('language dropdown opened', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  await page.click('[data-testid="DropdownDDLang"]')
  const component = page.locator('[data-testid="DropdownDDLang"] > ul')
  expect(await component.screenshot()).toMatchSnapshot('DDLang-opened.png', { maxDiffPixelRatio: 0.2 })
})

test('language dropdown changed', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  await page.click('[data-testid="DropdownDDLang"]')
  await page.click('[data-testid="DropdownDDLang-Item-de"]')
  const component = page.locator('[data-testid="DropdownDDLang"]')
  expect(await component.screenshot()).toMatchSnapshot('DDLang-changed.png', { maxDiffPixelRatio: 0.2 })
})
