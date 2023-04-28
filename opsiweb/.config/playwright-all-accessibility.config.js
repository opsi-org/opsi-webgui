// @ts-check
const generalconfig = require('../uib-components/.utils/playwright/config/playwright-config')

// /** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: '../', // /workspace/opsiweb
  // testDir: '../../../', // /workspace/opsiweb/uib-components
  testMatch: '*.test.*(accessibility).js',
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-accessibility.xml' }]
  ],
  testIgnore: generalconfig.testIgnore,
  workers: generalconfig.workers,
  expect: generalconfig.expect,
  use: generalconfig.use,
  projects: generalconfig.projects,
  timeout: 5 * 60 * 1000
}

module.exports = config
