const { test, expect } = require('@playwright/test')
const AxeBuilder = require('@axe-core/playwright').default
const { apiMock, cookieOpsiconfdSession } = require('../../uib-components/.utils/playwright/pw-api-mock')

test('Scan Sidebar for accessibility issues', async ({ page, context }) => {
  apiMock(page, '**/api/user/opsiserver', { result: 'testconfigserver.uib.local' })
  await page.goto('./login')
  const title = page.locator('[data-testid="login_title"]')
  await expect(title).toHaveText('opsi-webgui')
  await page.type('[placeholder="Username"]', 'adminuser')
  await page.press('[placeholder="Username"]', 'Tab')
  await page.type('[placeholder="Password"]', 'adminuser')
  await page.press('[placeholder="Password"]', 'Enter')
  apiMock(page, '**/api/auth/login', { result: 'Login success' })
  await context.addCookies(cookieOpsiconfdSession)
  const session = await context.cookies()
  expect(session).toEqual(cookieOpsiconfdSession)
  await (new Promise(resolve => setTimeout(resolve, 4000)))
  apiMock(page, '**/api/opsidata/depots/clients?selectedDepots=[testconfigserver.uib.local]', ['client1.uib.local', 'client2.uib.local', 'client3.uib.local', 'client4.uib.local', 'client5.uib.local'])
  apiMock(page, '**/api/opsidata/depot_ids', ['testconfigserver.uib.local', 'depot1.uib.local', 'depot2.uib.local', 'depot3.uib.local'])
  apiMock(page, '**/api/opsidata/clients?pageNumber=1&perPage=15&sortBy=clientId&sortDesc=false&filterQuery=&selected=&selectedDepots=["testconfigserver.uib.local"]&selectedClients=[]', [
    { clientId: 'client1.uib.local', ident: 'client1.uib.local', macAddress: 'af:fe:af:fe:af:f1', description: '', notes: '', version_outdated: 0, installationStatus_unknown: 0, installationStatus_installed: 0, actionResult_failed: 0, actionResult_successful: 0, selected: 0 },
    { clientId: 'client2.uib.local', ident: 'client2.uib.local', macAddress: 'af:fe:af:fe:af:f2', description: '', notes: '', version_outdated: 2, installationStatus_unknown: 2, installationStatus_installed: 2, actionResult_failed: 2, actionResult_successful: 2, selected: 0 }
  ])
  await expect(page).toHaveURL('/addons/webgui/app/clients/')
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .include('[data-testid="BarBSide"]')
    .analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
