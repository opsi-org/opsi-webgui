/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
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
    await simpleScreenshotTest(
      page,
      folder,
      filename.toLocaleLowerCase() + '-story-vue',
      filename,
      filename,
      afterDataTestidFound
    )
  })
})
