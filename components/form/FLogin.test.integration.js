const { test, expect } = require('@playwright/test')
const { callStoryIdMock } = require('../../.utils/playwright/pw-story-call')

test('form-login snapshot', async ({ page }) => {
  await callStoryIdMock(page, 'form-f-login', 'f-login',
    '**/api/user/opsiserver', { result: 'mydepot.uib.local' }
  )
  // const apiServerPath = '**/api/user/opsiserver'
  // await page.unroute(apiServerPath)
  // await apiMock(page, apiServerPath, { result: 'mydepot.uib.local' })

  const component = await page.locator('[data-testid="FLogin"]')
  expect(await component.screenshot()).toMatchSnapshot('FLogin.png')
})
