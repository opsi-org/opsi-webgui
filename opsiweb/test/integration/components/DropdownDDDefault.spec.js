const { test, expect } = require('@playwright/test')

test('dropdown ddefault single origin snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=dropdown-dd-default--dd-default-single&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-dddefault-single-origin.png')
})

test('dropdown ddefault single not origin snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=dropdown-dd-default--dd-default-single&args=&viewMode=story')
  await page.click('[data-testid="DropdownDDDefault"]')
  await page.click('[data-testid="DropdownDDDefault-Item-b"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-dddefault-single-not-origin.png')
})

test('dropdown ddefault multi origin snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=dropdown-dd-default--dd-default-multi&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-dddefault-multi-origin.png')
})

test('dropdown ddefault multi not origin snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=dropdown-dd-default--dd-default-multi&args=&viewMode=story')
  await page.click('[data-testid="DropdownDDDefault"]')
  await page.click('[data-testid="DropdownDDDefault-Item-c"]')
  await page.click('[data-testid="DropdownDDDefault-Item-a"]')
  expect(await page.screenshot()).toMatchSnapshot('comp-dropdown-dddefault-multi-not-origin.png')
})
