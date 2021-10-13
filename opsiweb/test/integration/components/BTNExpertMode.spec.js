const { test, expect } = require('@playwright/test')

test('button expert mode snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-expert-mode--btn-expert-mode&args=')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnexpertmode.png')
})

test('button expert mode clicked snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-expert-mode--btn-expert-mode&args=')
  await page.click('.btn')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnexpertmode-clicked.png')
})


test('button expert mode (navbar) snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-expert-mode--btn-expert-mode-navbar&args=&viewMode=story')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnexpertmode-navbar.png')
})

test('button expert mode (navbar) clicked snapshot', async ({ page }) => {
  await page.goto('http://localhost:3003/iframe.html?id=button-btn-expert-mode--btn-expert-mode-navbar&args=&viewMode=story')
  await page.click('.btn_expertmode')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnexpertmode-navbar-clicked.png')
})