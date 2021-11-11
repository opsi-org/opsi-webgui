const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('button expert mode snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-expert-mode', 'btn-expert-mode')
  const component = await page.locator('[data-testid="ButtonBTNExpertMode"]')
  expect(await component.screenshot()).toMatchSnapshot('button-btnexpertmode-normal.png')
})

test('button expert mode clicked snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-expert-mode', 'btn-expert-mode')
  await page.click('.btn')
  const component = await page.locator('[data-testid="ButtonBTNExpertMode"]')
  expect(await component.screenshot()).toMatchSnapshot('button-btnexpertmode-clicked.png')
})

test('button expert mode (navbar) snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-expert-mode', 'btn-expert-mode-navbar')
  const component = await page.locator('[data-testid="ButtonBTNExpertMode"]')
  expect(await component.screenshot()).toMatchSnapshot('button-btnexpertmode-navbar-normal.png')
})

test('button expert mode (navbar) clicked snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-expert-mode', 'btn-expert-mode-navbar')
  await page.click('.btn_expertmode')
  const component = await page.locator('[data-testid="ButtonBTNExpertMode"]')
  expect(await component.screenshot()).toMatchSnapshot('button-btnexpertmode-navbar-clicked.png', { threshold: 0.2 })
})
