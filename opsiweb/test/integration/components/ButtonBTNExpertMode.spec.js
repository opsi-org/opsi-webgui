const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils-pw/pw-story-call')

test('button expert mode snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-expert-mode', 'btn-expert-mode')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnexpertmode.png')
})

test('button expert mode clicked snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-expert-mode', 'btn-expert-mode')
  await page.click('.btn')

  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnexpertmode-clicked.png')
})

test('button expert mode (navbar) snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-expert-mode', 'btn-expert-mode-navbar')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnexpertmode-navbar.png')
})

test('button expert mode (navbar) clicked snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-expert-mode', 'btn-expert-mode-navbar')
  await page.click('.btn_expertmode')
  expect(await page.screenshot()).toMatchSnapshot('comp-button-btnexpertmode-navbar-clicked.png')
})
