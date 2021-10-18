const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('dropdown ddefault single origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-single')
  const component = await page.locator('[data-testid="DropdownDDDefault"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-dddefault-single-origin.png')
})

test('dropdown ddefault single not origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-single')
  await page.click('[data-testid="DropdownDDDefault-Button"]')
  await page.click('[data-testid="DropdownDDDefault-Item-b"]')
  // const component = await page.locator('[data-testid="DropdownDDDefault"]')
  expect(await page.screenshot()).toMatchSnapshot('dropdown-dddefault-single-not-origin.png', { threshold: 0.2 })
})

test('dropdown ddefault multi origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-multi')
  const component = await page.locator('[data-testid="DropdownDDDefault"]')
  expect(await component.screenshot()).toMatchSnapshot('dropdown-dddefault-multi-origin.png')
})

test('dropdown ddefault multi not origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-multi')
  await page.click('[data-testid="DropdownDDDefault-Button"]')
  await page.click('[data-testid="DropdownDDDefault-Item-c"]')
  await page.click('[data-testid="DropdownDDDefault-Item-a"]')
  // const component = await page.locator('[data-testid="DropdownDDDefault"]')
  expect(await page.screenshot()).toMatchSnapshot('dropdown-dddefault-multi-not-origin.png', { threshold: 0.2 })
})
