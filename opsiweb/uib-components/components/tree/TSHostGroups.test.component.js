
const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('treeselect-HostGroups', async ({ page }) => {
  await callStoryId(page, 'tree-ts-host-groups', 'ts-host-groups')
  const component = page.locator('[data-testid="TSHostGroups"]')
  expect(await component.screenshot()).toMatchSnapshot('TSHostGroups-closed.png')
})

test('treeselect-HostGroups openend', async ({ page }) => {
  await callStoryId(page, 'tree-ts-host-groups', 'ts-host-groups')
  await page.click('[data-testid="TSHostGroups"]')
  expect(await page.screenshot()).toMatchSnapshot('TSHostGroups-open.png')
})
