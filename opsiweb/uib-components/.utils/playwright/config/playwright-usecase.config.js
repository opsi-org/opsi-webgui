// @ts-check
const generalconfig = require('./playwright-config')

// /** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  // testDir: '../../../../', // /workspace/opsiweb
  testDir: '../../../', // /workspace/opsiweb/uib-components
  testMatch: '*.test.*(usecase).js',

  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-usecase.xml' }]
  ],
  testIgnore: generalconfig.testIgnore,
  workers: generalconfig.workers,
  expect: generalconfig.expect,
  use: generalconfig.use,
  projects: generalconfig.projects
}

module.exports = config
