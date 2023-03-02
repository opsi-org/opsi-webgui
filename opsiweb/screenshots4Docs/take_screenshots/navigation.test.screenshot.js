
const { test, expect } = require('@playwright/test')
const { apiMock, cookieOpsiconfdSession } = require('../../uib-components/.utils/playwright/pw-api-mock')

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.unroute('**/api/**')
    await apiMock(page, '**/api/user/opsiserver', { result: 'mydepot.uib.local' })
    await apiMock(page, '**/api/auth/login', { result: 'Login success' })
    await apiMock(page, '**/api/auth/logout', { result: 'logout success' })
    await page.goto('./login')
  })
  test('Clients - All Clients', async ({ page, context }) => {
    const title = page.locator('[data-testid="login_title"]')
    await expect(title).toHaveText('opsi-webgui')
    const configserver = page.locator('[data-testid="login_configserver"]')
    await expect(configserver).toHaveAttribute('placeholder', 'mydepot.uib.local')
    await page.type('[placeholder="Username"]', 'adminuser')
    await page.press('[placeholder="Username"]', 'Tab')
    await page.type('[placeholder="Password"]', 'adminuser')
    await page.press('[placeholder="Password"]', 'Enter')
    await context.addCookies(cookieOpsiconfdSession)
    const session = await context.cookies()
    expect(session).toEqual(cookieOpsiconfdSession)
    await expect(page).toHaveURL('/addons/webgui/app/clients/')
    // await page.click('[data-testid="NSidebar-title.clients"]')
    // const breadcrumb = page.locator('[data-testid="BarBBreadcrumb"]')
    // await expect(breadcrumb).toHaveText('clients')
    await page.screenshot({ path: './screenshots/en/opsiweb_nav_client.png' })
  })
  test('Clients - Creation', async ({ page, context }) => {
    const title = page.locator('[data-testid="login_title"]')
    await expect(title).toHaveText('opsi-webgui')
    const configserver = page.locator('[data-testid="login_configserver"]')
    await expect(configserver).toHaveAttribute('placeholder', 'mydepot.uib.local')
    await page.type('[placeholder="Username"]', 'adminuser')
    await page.press('[placeholder="Username"]', 'Tab')
    await page.type('[placeholder="Password"]', 'adminuser')
    await page.press('[placeholder="Password"]', 'Enter')
    await context.addCookies(cookieOpsiconfdSession)
    const session = await context.cookies()
    expect(session).toEqual(cookieOpsiconfdSession)
    await expect(page).toHaveURL('/addons/webgui/app/clients/')
    await page.click('[data-testid="NSidebar-title.clients"]')
    await page.click('[data-testid="NICollapsible-submenu-title.addNew"]')
    // const breadcrumb = page.locator('[data-testid="BarBBreadcrumb"]')
    // await expect(breadcrumb).toHaveText('client creation')
    await expect(page).toHaveURL('/addons/webgui/app/clientscreation')
    await page.screenshot({ path: './screenshots/en/opsiweb_nav_clientcreation.png' })
  })
})
