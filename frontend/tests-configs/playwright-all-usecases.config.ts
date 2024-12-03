// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import generalconfig from './playwright/config/playwright-config'

// /** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: '../tests/usecase/', // /workspace/opsiweb
  // testDir: '../../../', // /workspace/opsiweb/uib-components
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
  timeout: 5 * 60 * 1000,
}

// console.log('config', config)

// module.exports = config
export default config
