const { test, expect } = require('@playwright/test')
const AxeBuilder = require('@axe-core/playwright').default
const { apiMock } = require('../../uib-components/.utils/playwright/pw-api-mock')

test('Scan Login page for accessibility issues', async ({ page }) => {
  apiMock(page, '**/api/user/opsiserver', { result: 'testconfigserver.uib.local' })
  await page.goto('./login')
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
