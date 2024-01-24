// const { test, expect } = require('@playwright/test')
import { test } from '@playwright/test'
import { simpleScreenshotTest } from '../../tests-configs/playwright/utils/pw-story-call.ts'


test.describe('snapshot', () => {
  test('btnlogout-variant', async ({ page }) => {
    await simpleScreenshotTest(page, 'button', 'btnlogout-story-vue', 'BTNLogout', 'ButtonBTNLogout')
  })
})
