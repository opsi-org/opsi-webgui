const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('dropdown lang snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  const component = await page.locator('[data-testid="DropdownDDLang"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-ddlang.png')
})

test('dropdown lang opened snapshot', async ({ page }) => {
  // TODO: hover does not work (im sure its a playwright problem.. )
  // test.fail(browserName === 'webkit', 'This feature currently has problems on Mac')
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  await page.click('[data-testid="DropdownDDLang"]')
  // await page.click('[data-testid="DropdownDDLang-Item-de"]')
  expect(await page.screenshot()).toMatchSnapshot('dropdown-ddlang-opened.png')
})

test('dropdown lang changed snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
  await page.click('[data-testid="DropdownDDLang"]')
  await page.click('[data-testid="DropdownDDLang-Item-de"]')
  const component = await page.locator('[data-testid="DropdownDDLang"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-ddlang-changed.png')
})
