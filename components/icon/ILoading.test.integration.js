const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('icon-loading snapshot', async ({ page }) => {
  await callStoryId(page, 'icon-i-loading', 'i-loading')
  const component = await page.locator('[data-testid="ILoading"]')
  await component.evaluate(() => { document.querySelector('[data-testid="ILoading"] .loading-icon').classList.remove('b-icon-animation-cylon') })
  expect(await component.screenshot()).toMatchSnapshot('ILoading.png', { threshold: 0.5 })
})
