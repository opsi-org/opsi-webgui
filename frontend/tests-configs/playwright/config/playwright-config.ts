// const { devices } = require('@playwright/test')
import { devices } from '@playwright/test'

export const use = {
  // browserName: 'chromium',
  baseURL: 'https://localhost:8888/addons/webgui/app/',
  // headless: false,
  viewport: { width: 1280, height: 720 },
  headless: true,
  ignoreHTTPSErrors: true,
  screenshot: 'only-on-failure',
  actionTimeout: 10 * 1000,
  navigationTimeout: 40 * 1000,
  // video: 'on-first-retry'
}

export const projects = [
  {
    name: 'Chromium-Desktop',
    use: { browserName: 'chromium', ...devices['Desktop Chrome'] },
  },
  // { name: 'Chromium-Mobile', use: { browserName: 'chromium', ...devices['Galaxy S8'] } }
  // { name: 'Firefox-Desktop', use: { browserName: 'firefox', ...devices['Desktop Firefox'] } },
  // { name: 'Firefox-Mobile', use: { browserName: 'firefox', ...devices['Nexus 6'] } },
  // { name: 'WebKit-Desktop', use: { browserName: 'webkit', ...devices['Desktop Safari'] } },
  // { name: 'WebKit-Mobile', use: { browserName: 'webkit', ...devices['iPhone 11'] } }
]

export const testIgnore = '@/**/*.test.unit.js'
export const workers = 4 // cause for me locally it exists 8 cpu cores (recommendation is to use the half of it)
export const expect = {
  toMatchSnapshot: { threshold: 0.2 },
  timeout: 10 * 1000,
}
// quiet: true,
// reporter: 'line',
// reporter: 'jest-silent-reporter',
// retries: 1, // sometimes first try simply do not work.. :|
// globalSetup: require.resolve('./test/.utils-pw/pw-global-setup.js'),
// forbidOnly: !!process.env.CI,

export default {
  use,
  projects,
  testIgnore,
  workers,
  expect,
} as any
