/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import generalconfig from './playwright/config/playwright-config'

// /** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: '../tests/usecase/', // /workspace/opsiweb
  // testDir: '../../../', // /workspace/opsiweb/uib-components
  testMatch: '*.test.*(usecase).js',
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-usecase.xml' }],
  ],
  testIgnore: generalconfig.testIgnore,
  workers: generalconfig.workers,
  expect: generalconfig.expect,
  use: generalconfig.use,
  projects: generalconfig.projects,
  timeout: 5 * 60 * 1000,
}

// console.log('config', config)

// module.exports = config
export default config
