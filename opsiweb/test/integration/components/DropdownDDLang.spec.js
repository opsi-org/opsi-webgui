const { test, expect } = require('@playwright/test')

test('dropdown lang snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=dropdown-dd-lang--dd-lang&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-ddlang.png')
})

test('dropdown lang opened snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=dropdown-dd-lang--dd-lang&viewMode=story')
  await page.click('[data-testid="DropdownDDLang"]')
  // await page.click('[data-testid="DropdownDDLang-Item-de"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-ddlang-opened.png')
})

test('dropdown lang changed snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=dropdown-dd-lang--dd-lang&viewMode=story')
  await page.click('[data-testid="DropdownDDLang"]')
  await page.click('[data-testid="DropdownDDLang-Item-de"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-ddlang-changed.png')
})
