const { devices } = require('@playwright/test')

module.exports.use = {
  // browserName: 'chromium',
  baseURL: 'https://localhost:8888/webgui/app/',
  // headless: false,
  viewport: { width: 1280, height: 720 },
  headless: true,
  ignoreHTTPSErrors: true,
  screenshot: 'only-on-failure'
  // video: 'on-first-retry'
}

module.exports.projects = [
  { name: 'Chromium-Desktop', use: { browserName: 'chromium', ...devices['Desktop Chrome'] } },
  { name: 'Firefox-Desktop', use: { browserName: 'firefox', ...devices['Desktop Firefox'] } }
  // { name: 'WebKit-Desktop', use: { browserName: 'webkit', ...devices['Desktop Safari'] } }
  // { name: 'Chromium-Mobile', use: { browserName: 'chromium', ...devices['Galaxy S8'] } },
  // { name: 'Firefox-Mobile', use: { browserName: 'firefox', ...devices['Nexus 6'] } },
  // { name: 'WebKit-Mobile', use: { browserName: 'webkit', ...devices['iPhone 11'] } }
]

module.exports.testIgnore = 'components/**/*.test.unit.js'
module.exports.workers = 4 // cause for me locally it exists 8 cpu cores (recommendation is to use the half of it)
module.exports.expect = { toMatchSnapshot: { threshold: 0.1 } }
// quiet: true,
// reporter: 'line',
// reporter: 'jest-silent-reporter',
// retries: 1, // sometimes first try simply do not work.. :|
// globalSetup: require.resolve('./test/.utils-pw/pw-global-setup.js'),
// forbidOnly: !!process.env.CI,
