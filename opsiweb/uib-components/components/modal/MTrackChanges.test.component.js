const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('track changes modal', async ({ page }) => {
  await callStoryId(page, 'modal-m-track-changes', 'm-track-changes')
  const component = page.locator('[data-testid="MTrackChanges"]')
  expect(await component.screenshot()).toMatchSnapshot('MTrackChanges.png')
})
