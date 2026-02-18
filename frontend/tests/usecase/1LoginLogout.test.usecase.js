import { test, expect } from '@playwright/test'
import { apiMock } from '../../tests-configs/playwright/utils/pw-api-mock'
// import { apiMock, cookieOpsiconfdSession } from '../../tests-configs/playwright/utils/pw-api-mock'
import { pageLogin, pageLogout } from '../../tests-configs/playwright/utils/pw-global-setup'
// const cookie = Object.freeze(cookieOpsiconfdSession)

// test.beforeEach(async ({ page }) => {
//   // logging
//   // page.on('console', m => console.log(m.text()))
//   // page.on('requestfailed', request => (!request.url().includes('4447')) ? '' : console.log(`>>f ${request.method()} ${request.url()} ${JSON.stringify(request.failure())}`))
//   // page.on('request', request => {
//   //   if (request.url().includes('4447')) {
//   //     console.log(`>> ${request.method()} ${request.url()}`)
//   //   }
//   // })
//   // page.on('response', async response => {
//   //   if (response.url().includes('4447')) {
//   //     let txt = (await response.body()).toString()
//   //     console.log(`<< ${response.status()} ${response.url()} ${txt}`)
//   //   }
//   // })
//   // await page.unroute('**/webgui/api/**')
//   // await apiMock(page, '**/webgui/api/**', {})
//   // await apiMock(page, '**/api/user/opsiserver', { result: 'testconfigserver.uib.local' })
//   // await page.goto('./login')

//   // await apiMock(page, '**/api/user/configuration', {"user":"adminuser","configuration":{"read_only":false,"depot_access":false,"host_group_access":false,"product_group_access":false,"client_creation":true}})
//   // await apiMock(page, '**/api/opsidata/server/disabled-features', [])
// })

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
