const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

// // // // // // // // // // // // // // // // // // // // // // // // // // // //
test('dropdown ddefault single origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-single')
  const component = await page.locator('[data-testid="DropdownDDDefault"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-dddefault-single-origin.png')
})
test('dropdown ddefault single not origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-single-not-origin')
  const component = await page.locator('[data-testid="DropdownDDDefault"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-dddefault-single-not-origin.png')
})

test('dropdown ddefault single content snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-single')
  await page.click('[data-testid="DropdownDDDefault-Button"]')
  // await page.waitForSelector('[data-testid="DropdownDDDefault"] > ul')
  const content = await page.locator('[data-testid="DropdownDDDefault-Button"] > ul')
  expect(await content.screenshot()).toMatchSnapshot('dropdown-dddefault-single-content.png')
})

// // // // // // // // // // // // // // // // // // // // // // // // // // // //
test('dropdown ddefault multi origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-multi')
  const component = await page.locator('[data-testid="DropdownDDDefault"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-dddefault-multi-origin.png')
})

test('dropdown ddefault multi not origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-multi-not-origin')
  const component = await page.locator('[data-testid="DropdownDDDefault"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-dddefault-multi-not-origin.png', { threshold: 0.2 })
})

test('dropdown ddefault multi content snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-multi')
  await page.click('[data-testid="DropdownDDDefault-Button"]')
  // await page.waitForSelector('[data-testid="DropdownDDDefault"] > ul')
  const content = await page.locator('[data-testid="DropdownDDDefault-Button"] > ul')
  expect(await content.screenshot()).toMatchSnapshot('dropdown-dddefault-multi-content.png')
})
