const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('treeselect-clients-not-stored snapshot', async ({ page }) => {
  await callStoryId(page, 'tree-ts-clients-not-stored', 'ts-clients-not-stored')
  const component = await page.locator('[data-testid="TSClientsNotStored"]')
  expect(await component.screenshot()).toMatchSnapshot('TSClientsNotStored-closed.png')
})

test('treeselect-clients-not-stored opened snapshot', async ({ page }) => {
  await callStoryId(page, 'tree-ts-clients-not-stored', 'ts-clients-not-stored')
  await page.click('[data-testid="TSClientsNotStored"]')
  // const component = await page.locator('[data-testid="TSClientsNotStored"]')
  // await component.click()
  // await (new Promise(resolve => setTimeout(resolve, 1000)))
  expect(await page.screenshot()).toMatchSnapshot('TSClientsNotStored-opened.png')
})
