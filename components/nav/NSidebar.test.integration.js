const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

// not expanded
test('nav-sidebar snapshot collapsed', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-not-expanded')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('nav-sidebar-not-expanded.png')
})

test('nav-sidebar snapshot collapsed hover depots', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-not-expanded')
  await page.hover('[data-testid="NSidebar-title.depots"]')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('nav-sidebar-not-expanded-depots.png')
})

test('nav-sidebar snapshot collapsed hover clients', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-not-expanded')
  await page.hover('[data-testid="NSidebar-title.clients"]')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('nav-sidebar-not-expanded-clients.png')
})

// expanded
test('nav-sidebar snapshot expanded', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-expanded')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('nav-sidebar-expanded.png')
})

test('nav-sidebar snapshot depots expanded', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-expanded')
  await page.click('[data-testid="NSidebar-title.depots"]')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('nav-sidebar-expanded-depots.png')
})

test('nav-sidebar snapshot clients expanded', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-expanded')
  await page.click('[data-testid="NSidebar-title.clients"]')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('nav-sidebar-expanded-clients.png')
})
