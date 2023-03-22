const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button event ondemand snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-event', 'btn-event-on-demand-default')
  const component = await page.locator('[data-testid="BTNEvent"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNEventOnDemand.png')
})

test('button event reboot snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-event', 'btn-event-reboot')
  const component = await page.locator('[data-testid="BTNEvent"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNEventReboot.png')
})

test('button event notify snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-event', 'btn-event-notify')
  const component = await page.locator('[data-testid="BTNEvent"]')
  expect(await component.screenshot()).toMatchSnapshot('BTNEventNotify.png')
})
