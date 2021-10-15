const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('dropdown lang snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-ddlang.png')
})

test('dropdown lang opened snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  await page.click('[data-testid="DropdownDDLang"]')
  // await page.click('[data-testid="DropdownDDLang-Item-de"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-ddlang-opened.png')
})

test('dropdown lang changed snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  await page.click('[data-testid="DropdownDDLang"]')
  await page.click('[data-testid="DropdownDDLang-Item-de"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-ddlang-changed.png')
})
