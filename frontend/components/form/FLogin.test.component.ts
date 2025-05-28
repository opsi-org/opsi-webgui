/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { test } from '@playwright/test'
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
    await simpleScreenshotTest(
      page,
      folder,
      filename.toLocaleLowerCase() + '-story-vue',
      filename,
      filename
      // afterDataTestidFound
    )
  })
})
