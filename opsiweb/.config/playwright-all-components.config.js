// @ts-check
const generalconfig = require('../uib-components/.utils/playwright/config/playwright-config')

// /** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  // testDir: '../../../../', // /workspace/opsiweb
  // testDir: '../', // /workspace/opsiweb/uib-components
  testMatch: '*.test.*(int|integration|component|comp).js',
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-components.xml' }]
  ],
  testIgnore: generalconfig.testIgnore,
  workers: generalconfig.workers,
  expect: generalconfig.expect,
  use: generalconfig.use,
  projects: generalconfig.projects
}

module.exports = config
