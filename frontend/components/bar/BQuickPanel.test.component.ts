/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { test } from '@playwright/test'
import { simpleScreenshotTest } from '../../tests/shared/pw-story-call.ts'

const folder = 'bar'
const filename = 'BQuickPanel'

test.describe('snapshot', () => {
  test(folder + '/' + filename + '', async ({ page }) => {
    await simpleScreenshotTest(
      page,
      folder,
      filename.toLocaleLowerCase() + '-story-vue',
      filename,
      filename
    )
  })
})
