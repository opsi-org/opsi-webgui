const { devices } = require('@playwright/test')

const config = {
  testDir: '../',
  testMatch: '*.test.screenshot.js',
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-screenshot.xml' }]
  ],
  workers: 4,
  expect: {
    toMatchSnapshot: { threshold: 0.2 },
    timeout: 10 * 1000
  },
  use: {
    baseURL: 'https://localhost:8888/addons/webgui/app/',
    viewport: { width: 900, height: 500 },
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000
  },
  projects: [
    { name: 'Chromium-Desktop', use: { browserName: 'chromium', ...devices['Desktop Chrome'] } }
  ]
}

module.exports = config
