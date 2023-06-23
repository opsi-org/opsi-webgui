const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('client agent deployment modal', async ({ page }) => {
  await callStoryId(page, 'modal-m-deploy-client-agent', 'm-deploy-client-agent')
  const component = page.locator('[data-testid="MDeployClientAgent"]')
  expect(await component.screenshot()).toMatchSnapshot('MDeployClientAgent.png')
})
