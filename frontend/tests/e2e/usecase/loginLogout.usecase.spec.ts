import { test, expect } from '@playwright/test'
import { apiMock } from '../../tests-configs/playwright/utils/pw-api-mock'
import { pageLogin, pageLogout } from '../../tests-configs/playwright/utils/pw-global-setup'

test.afterEach(async ({ page }) => {
  await page.close()
})

test.describe('usecase', () => {
  test('Login and Logout', async ({ page, context }) => {
    await pageLogin(page, context)
    await page.screenshot({ path: './tests-screenshots/login-success.png' })

    await pageLogout(page)
    await page.screenshot({ path: './tests-screenshots/logout-success.png' })
  })
})
test('Login with incorrect credentials', async ({ page }) => {
  const preRoute = async () => {
    await apiMock(page, '**/auth/login', {
      http_status: 403,
      error: '',
      message: 'My Opsi service authentication error',
    })
  }
  const postLoginClick = async (page) => {
    await page.waitForSelector('.el-notification')
    await new Promise((r) => setTimeout(r, 500))
    await page.screenshot({ path: './tests-screenshots/login-failed.png' })
    await expect(page.locator('.el-notification')).toContainText('Forbidden')
  }

  await pageLogin(page, null, preRoute, postLoginClick, 'adminuser', 'adminuser-wrong')
})
