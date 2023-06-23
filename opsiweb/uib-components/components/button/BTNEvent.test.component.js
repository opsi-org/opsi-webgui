const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test.describe('snapshot', () => {
  test('ondemand', async ({ page }) => {
    await callStoryId(page, 'button-btn-event', 'btn-event-on-demand-default')
    const component = page.locator('[data-testid="BTNEvent"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNEventOnDemand.png')
  })

  test('reboot', async ({ page }) => {
    await callStoryId(page, 'button-btn-event', 'btn-event-reboot')
    const component = page.locator('[data-testid="BTNEvent"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNEventReboot.png')
  })

  test('notify', async ({ page }) => {
    await callStoryId(page, 'button-btn-event', 'btn-event-notify')
    const component = page.locator('[data-testid="BTNEvent"]')
    expect(await component.screenshot()).toMatchSnapshot('BTNEventNotify.png')
  })
})
