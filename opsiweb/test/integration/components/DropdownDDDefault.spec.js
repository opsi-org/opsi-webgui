const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('dropdown ddefault single origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-single')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-dddefault-single-origin.png')
})

test('dropdown ddefault single not origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-single')
  await page.click('[data-testid="DropdownDDDefault"]')
  await page.click('[data-testid="DropdownDDDefault-Item-b"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-dddefault-single-not-origin.png')
})

test('dropdown ddefault multi origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-multi')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-dddefault-multi-origin.png')
})

test('dropdown ddefault multi not origin snapshot', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-default', 'dd-default-multi')
  await page.click('[data-testid="DropdownDDDefault"]')
  await page.click('[data-testid="DropdownDDDefault-Item-c"]')
  await page.click('[data-testid="DropdownDDDefault-Item-a"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-dddefault-multi-not-origin.png')
})
