// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testIgnore: 'test/unit/**/*.spec.js',
  retries: 2,
  globalSetup: require.resolve('./test/.utils-pw/pw-global-setup.js'),
  use: {
    browserName: 'chromium',
    baseURL: 'https://localhost:8888/webgui/app/',
    // headless: false,
    // viewport: { width: 1280, height: 720 },
    headless: true,
    ignoreHTTPSErrors: true
    // video: 'on-first-retry'
  }
}

module.exports = config
