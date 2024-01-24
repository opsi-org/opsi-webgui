// const { test, expect } = require('@playwright/test')
import { test, type Page } from '@playwright/test'
import { simpleScreenshotTest } from '../../tests-configs/playwright/utils/pw-story-call'


test.describe('snapshot', () => {
  test('bauthfooter', async ({ page }) => {
    const afterDataTestidFound = async (p: Page, el: any) => {
      await el.evaluate(() => {
        const version = document.querySelector('.BAuthFooter-version')
        if (version) version.innerHTML = 'x.x.x'
      })
    }

    await simpleScreenshotTest(page, 'bar', 'bauthfooter-story-vue', 'BAuthFooter','BarBAuthFooter', afterDataTestidFound)
  })
})
