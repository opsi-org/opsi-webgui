const { test, expect } = require('@playwright/test')

test('login and logout again', async ({ page }) => {
  await page.goto('./login')
  title = page.locator('.server')
  await expect(title).toHaveAttribute('placeholder', 'bonifax.uib.local')

  await page.click('[placeholder="Username"]')
  await page.fill('[placeholder="Username"]', 'adminuser')
  await page.press('[placeholder="Username"]', 'Tab')
  await page.fill('[placeholder="Password"]', 'adminuser')
  await page.press('[placeholder="Password"]', 'Enter')
  await page.waitForNavigation({ url: 'https://localhost:8888/webgui/app/' })

  await page.click('[data-testid="btn-logout"]')
  await page.waitForNavigation({ url: 'https://localhost:8888/webgui/app/login' })
  title = page.locator('.login_title')
  await expect(title).toHaveText('OPSIWEB')
})
