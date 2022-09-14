// @ts-check
const generalconfig = require('../uib-components/.utils/playwright/config/playwright-config')

// /** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  // testDir: '../../../../', // /workspace/opsiweb
  // timeout: 1000 * 15, // 1ms * x sec
  testDir: '../', // /workspace/opsiweb/uib-components
  testMatch: '*.test.component.js',
  fullyParallel: true,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-component.xml' }]
  ],
  testIgnore: generalconfig.testIgnore,
  workers: generalconfig.workers,
  expect: generalconfig.expect,
  use: generalconfig.use,
  projects: generalconfig.projects,
  timeout: 5 * 60 * 1000
}

module.exports = config
