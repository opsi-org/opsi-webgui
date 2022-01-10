// @ts-check
const generalconfig = require('./playwright-config')

// /** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  // testDir: '../../../../', // /workspace/opsiweb
  testDir: '../../../', // /workspace/opsiweb/uib-components
  testMatch: '*.test.*(int|integration).js',
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-integration.xml' }]
  ],
  testIgnore: generalconfig.testIgnore,
  workers: generalconfig.workers,
  expect: generalconfig.expect,
  use: generalconfig.use,
  projects: generalconfig.projects
}

module.exports = config
