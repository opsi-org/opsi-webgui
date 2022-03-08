
const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('treeselect-HostGroups snapshot', async ({ page }) => {
  await callStoryId(page, 'tree-ts-host-groups', 'ts-host-groups')
  const component = await page.locator('[data-testid="TSHostGroups"]')
  expect(await component.screenshot()).toMatchSnapshot('tree-tshostgroups.png')
})

test('treeselect-HostGroups snapshot open', async ({ page }) => {
  await callStoryId(page, 'tree-ts-host-groups', 'ts-host-groups')
  await page.click('[data-testid="TSHostGroups"]')
  // const component = await page.locator('[data-testid="TSHostGroups"]')
  expect(await page.screenshot()).toMatchSnapshot('tree-tshostgroups-open.png')
})
