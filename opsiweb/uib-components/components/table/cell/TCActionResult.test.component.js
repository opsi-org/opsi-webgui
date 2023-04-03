const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../../.utils/playwright/pw-story-call')

test('tableCell actionResult unknown snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-unknown')
  const component = await page.locator('[data-testid="TCActionResult"]')
  expect(await component.screenshot()).toMatchSnapshot('TCActionResult-unknown.png')
})

test('tableCell actionResult installed snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-installed')
  const component = await page.locator('[data-testid="TCActionResult"]')
  expect(await component.screenshot()).toMatchSnapshot('TCActionResult-installed.png')
})

test('tableCell actionResult success snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-success')
  const component = await page.locator('[data-testid="TCActionResult"]')
  expect(await component.screenshot()).toMatchSnapshot('TCActionResult-success.png')
})

test('tableCell actionResult failed snapshot', async ({ page }) => {
  await callStoryId(page, 'tablecell-t-c-action-result', 'tc-action-result-failed')
  const component = await page.locator('[data-testid="TCActionResult"]')
  expect(await component.screenshot()).toMatchSnapshot('TCActionResult-failed.png')
})
