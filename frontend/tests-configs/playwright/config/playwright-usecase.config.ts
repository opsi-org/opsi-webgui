/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import generalconfig from './playwright-config'

// /** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: '../../tests/usecase/', // /workspace/opsiweb
  testMatch: '*.test.*(usecase).js',

  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-result-pw-reporter-usecase.xml' }],
  ],
  testIgnore: generalconfig.testIgnore,
  workers: generalconfig.workers,
  expect: generalconfig.expect,
  use: generalconfig.use,
  projects: generalconfig.projects,
}

// module.exports = config
export default { config }
