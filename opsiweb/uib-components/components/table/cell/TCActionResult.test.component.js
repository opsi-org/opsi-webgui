const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('actionResult unknown', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-unknown')
  const component = page.locator('[data-testid="TCActionResult"]')
  expect(await component.screenshot()).toMatchSnapshot('TCActionResult-unknown.png')
})

test('actionResult installed', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-installed')
  const component = page.locator('[data-testid="TCActionResult"]')
  expect(await component.screenshot()).toMatchSnapshot('TCActionResult-installed.png')
})

test('actionResult success', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-success')
  const component = page.locator('[data-testid="TCActionResult"]')
  expect(await component.screenshot()).toMatchSnapshot('TCActionResult-success.png')
})

test('actionResult failed', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-failed')
  const component = page.locator('[data-testid="TCActionResult"]')
  expect(await component.screenshot()).toMatchSnapshot('TCActionResult-failed.png')
})
