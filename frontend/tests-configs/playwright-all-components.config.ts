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
  // testDir: '../../../../', // /workspace/opsiweb
  // timeout: 1000 * 15, // 1ms * x sec
  testDir: '../', // /workspace/opsiweb/uib-components
  testMatch: '*.test.component.*(js|ts)',
  fullyParallel: true,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-component.xml' }],
  ],
  testIgnore: generalconfig.testIgnore,
  workers: generalconfig.workers,
  expect: generalconfig.expect,
  use: generalconfig.use,
  projects: generalconfig.projects,
  timeout: 5 * 60 * 1000,
}

// module.exports = config
export default config
