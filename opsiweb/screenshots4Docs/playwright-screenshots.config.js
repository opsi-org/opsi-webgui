const { devices } = require('@playwright/test')
const generalconfig = require('../uib-components/.utils/playwright/config/playwright-config')

const config = {
  testDir: '../',
  testMatch: '*.test.screenshot.js',

  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-screenshot.xml' }]
  ],
  testIgnore: generalconfig.testIgnore,
  workers: generalconfig.workers,
  expect: generalconfig.expect,
  use: generalconfig.use,
  projects: [
    { name: 'Chromium-Desktop', use: { browserName: 'chromium', ...devices['Desktop Chrome'] } }
  ]
}

module.exports = config
