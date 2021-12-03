const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../.utils/playwright/pw-story-call')

test('treeselect-hostgroup-lazyload snapshot', async ({ page }) => {
  await callStoryId(page, 'tree-t-s-hostgroup-lazyload', 'ts-host-group-lazy-load')
  const component = await page.locator('[data-testid="TSHostGroupLazyLoad"]')
  expect(await component.screenshot()).toMatchSnapshot('tree-tshostgrouplazyload.png')
})
