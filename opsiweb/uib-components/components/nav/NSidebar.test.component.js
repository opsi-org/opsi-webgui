const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('sidebar collapsed', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-not-expanded')
  const component = page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-not-expanded-main.png', { maxDiffPixelRatio: 0.2 })
})

test('sidebar collapsed with depots hovered', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-not-expanded')
  await page.hover('[data-testid="NSidebar-title.depots"]')
  const component = page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-not-expanded-depots.png', { threshold: 0.1 })
})

test('sidebar collapsed with clients hovered', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-not-expanded')
  await page.hover('[data-testid="NSidebar-title.clients"]')
  const component = page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-not-expanded-clients.png', { threshold: 0.1 })
})

test('sidebar expanded', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-expanded')
  const component = page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-expanded-main.png', { threshold: 0.1 })
})

test('sidebar with depots expanded', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-expanded')
  await page.click('[data-testid="NSidebar-title.depots"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-expanded-depots.png', { threshold: 0.1 })
})

test('sidebar with clients expanded', async ({ page }) => {
  await callStoryId(page, 'nav-n-sidebar', 'n-sidebar-expanded')
  await page.click('[data-testid="NSidebar-title.clients"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = page.locator('[data-testid="NSidebar"]')
  expect(await component.screenshot()).toMatchSnapshot('NSidebar-expanded-clients.png', { threshold: 0.1 })
})
