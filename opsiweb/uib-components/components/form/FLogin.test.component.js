const { test, expect } = require('@playwright/test')
const { callStoryId } = require('../../.utils/playwright/pw-story-call')

test('form-login snapshot', async ({ page }) => {
  // TODO fix callStoryIdMock
  // await callStoryIdMock(page, 'form-f-login', 'f-login',
  //   '**/api/user/opsiserver', { result: 'mydepot.uib.local' }
  // )
  await callStoryId(page, 'form-f-login', 'f-login')
  // const apiServerPath = '**/api/user/opsiserver'
  // await page.unroute(apiServerPath)
  // await apiMock(page, apiServerPath, { result: 'mydepot.uib.local' })
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  const component = await page.locator('[data-testid="FLogin"]')
  expect(await component.screenshot()).toMatchSnapshot('FLogin.png')
})
