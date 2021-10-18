// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testIgnore: 'test/unit/**/*.spec.js',
  retries: 2, // sometimes first try simply do not work.. :|
  workers: 4, // cause for me locally it exists 8 cpu cores (recommendation is to use the half of it)
  expect: { toMatchSnapshot: { threshold: 0.1 } },
  globalSetup: require.resolve('./test/.utils-pw/pw-global-setup.js'),
  // forbidOnly: !!process.env.CI,
  use: {
    browserName: 'chromium',
    baseURL: 'https://localhost:8888/webgui/app/',
    // headless: false,
    // viewport: { width: 1280, height: 720 },
    headless: true,
    ignoreHTTPSErrors: true
    // video: 'on-first-retry'
  },
  projects: [
    { name: 'Chromium', use: { browserName: 'chromium' } }
    // { name: 'Firefox', use: { browserName: 'firefox' } },
    // { name: 'WebKit', use: { browserName: 'webkit' } }
  ]
}

module.exports = config
