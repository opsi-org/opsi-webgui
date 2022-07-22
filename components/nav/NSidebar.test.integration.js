const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

// not expanded
test('nav-sidebar snapshot collapsed', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-not-expanded')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-not-expanded-main.png', { threshold: 0.2 })
})

test('nav-sidebar snapshot collapsed hover depots', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-not-expanded')
  await page.hover('[data-testid="NSidebar-title.depots"]')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-not-expanded-depots.png', { threshold: 0.2 })
})

test('nav-sidebar snapshot collapsed hover clients', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-not-expanded')
  await page.hover('[data-testid="NSidebar-title.clients"]')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-not-expanded-clients.png', { threshold: 0.2 })
})

// expanded
test('nav-sidebar snapshot expanded', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-expanded')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-expanded-main.png')
})

test('nav-sidebar snapshot depots expanded', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-expanded')
  await page.click('[data-testid="NSidebar-title.depots"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  // await page.waitForSelector('#collapse-navitem-title.depots, [data-testid="NICollapsible-submenu-title.config"]')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-expanded-depots.png')
})

test('nav-sidebar snapshot clients expanded', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-expanded')
  await page.click('[data-testid="NSidebar-title.clients"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  // await page.waitForSelector('[data-testid="NSidebar-title.clients"]')
  const component = await page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-expanded-clients.png')
})
