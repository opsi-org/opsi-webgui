/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import generalconfig from './playwright-config'

// /** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: '../../components/',
  testMatch: '*.test.component.js',
  fullyParallel: true,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-component.xml' }],
  ],
  testIgnore: generalconfig.testIgnore,
  workers: generalconfig.workers,
  expect: generalconfig.expect,
  use: generalconfig.use,
  projects: generalconfig.projects,
  timeout: 5 * 60 * 1000,
}

// module.exports = config
export default { config }
