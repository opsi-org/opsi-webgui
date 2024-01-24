import { test, type Page } from '@playwright/test'
import { simpleScreenshotTest } from '../../tests-configs/playwright/utils/pw-story-call.ts'

const folder = 'form'
const filename = 'FLogin'

test.describe('snapshot', () => {
  test(folder + '/' + filename + '', async ({ page }) => {
    // const afterDataTestidFound = async (p: Page, el: any) => {
    //   await p.fill('[data-testid="login_configserver"]', 'testserver.domain.local')
    //   // await el.evaluate(() => {
    //     // const servername = document.querySelector('[data-testid="login_configserver"]')
    //     // if (servername) servername. = 'testconfigserver'
    //   // })
    // }
    await simpleScreenshotTest(page, folder, filename.toLocaleLowerCase() + '-story-vue', filename, filename,
      // afterDataTestidFound
    )
  })
})