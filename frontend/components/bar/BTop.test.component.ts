// const { test, expect } = require('@playwright/test')
import { test } from '@playwright/test'
import { simpleScreenshotTest } from '../../tests-configs/playwright/utils/pw-story-call.ts'


test.describe('snapshot', () => {
  test('btop-variant', async ({ page }) => {
    await simpleScreenshotTest(page, 'bar', 'btop-story-vue', 'BTop', 'BTop')
  })
})
