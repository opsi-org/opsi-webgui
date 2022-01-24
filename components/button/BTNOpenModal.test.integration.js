const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('button open modal snapshot', async ({ page }) => {
  await callStoryId(page, 'button-btn-open-modal', 'btn-open-modal')
  const component = await page.locator('[data-testid="ButtonBTNOpenModal"]')
  expect(await component.screenshot()).toMatchSnapshot('button-btnopenmodal.png')
})
