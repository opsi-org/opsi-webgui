// @ts-check

const { devices } = require('@playwright/test')

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testIgnore: 'test/unit/**/*.spec.js',
  // retries: 1, // sometimes first try simply do not work.. :|
  workers: 4, // cause for me locally it exists 8 cpu cores (recommendation is to use the half of it)
  expect: { toMatchSnapshot: { threshold: 0.1 } },
  // globalSetup: require.resolve('./test/.utils-pw/pw-global-setup.js'),
  // forbidOnly: !!process.env.CI,
  use: {
    // browserName: 'chromium',
    baseURL: 'https://localhost:8888/webgui/app/',
    // headless: false,
    viewport: { width: 1280, height: 720 },
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure'
    // video: 'on-first-retry'
  },
  projects: [
    { name: 'Chromium-Desktop', use: { browserName: 'chromium', ...devices['Desktop Chrome'] } },
    // { name: 'Firefox-Desktop', use: { browserName: 'firefox', ...devices['Desktop Firefox'] } },
    // { name: 'WebKit-Desktop', use: { browserName: 'webkit', ...devices['Desktop Safari'] } }
    // { name: 'Chromium-Mobile', use: { browserName: 'chromium', ...devices['Galaxy S8'] } },
    // { name: 'Firefox-Mobile', use: { browserName: 'firefox', ...devices['Nexus 6'] } },
    // { name: 'WebKit-Mobile', use: { browserName: 'webkit', ...devices['iPhone 11'] } }
  ]
}

module.exports = config
