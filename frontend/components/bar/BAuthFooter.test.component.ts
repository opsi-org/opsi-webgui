// const { test, expect } = require('@playwright/test')
import { test, type Page } from '@playwright/test'
import { simpleScreenshotTest } from '../../tests-configs/playwright/utils/pw-story-call.ts'

const folder = 'bar'
const filename = 'BAuthFooter'

test.describe('snapshot', () => {
  test(folder + '/' + filename + '', async ({ page }) => {
    const afterDataTestidFound = async (p: Page, el: any) => {
      await el.evaluate(() => {
        const version = document.querySelector('.BAuthFooter-version')
        if (version) version.innerHTML = 'x.x.x'
      })
    }
    await simpleScreenshotTest(page, folder, filename.toLocaleLowerCase() + '-story-vue', filename,filename, afterDataTestidFound)
  })
})