// const { test, expect } = require('@playwright/test')
import { test } from '@playwright/test'
import { simpleScreenshotTest } from '../../tests-configs/playwright/utils/pw-story-call.ts'


test.describe('snapshot', () => {
  test('btn-variants', async ({ page }) => {
    await simpleScreenshotTest(page, 'button', 'btn-story-vue', 'BTN')
  })
  // test('bauthfooter-variant', async ({ page }) => {
  //   await simpleScreenshotTest(page, 'bar', 'bauthfooter-story-vue', 'BAuthFooter','BarBAuthFooter')
  // })
  // test('btnlogout-variant', async ({ page }) => {
  //   await simpleScreenshotTest(page, 'button', 'btnlogout-story-vue', 'BTNLogout', 'ButtonBTNLogout')
  // })
})
