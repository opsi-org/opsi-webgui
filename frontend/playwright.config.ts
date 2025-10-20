import { defineConfig, devices } from '@playwright/test'

//const WEBGUI_DEV_PORT = process.env.WEBGUI_DEV_PORT || 8888
//const OPSICONFD_PORT = process.env.OPSICONFD_PORT || 44471
const HOSTNAME = process.env.HOSTNAME || 'localhost'

let BASE_URL = ''
let APP_PATH = ''
// we use webgui from 'production' (~> actually 44471 but from inside container it is 4447)
if (!process.env.CI) {
  // development environment
  BASE_URL = `https://${HOSTNAME}:4447/` // port from inside containers is not 44471/2
  APP_PATH = 'addons/webgui-dev/app/'
  console.log('We are not in CICD: ' + BASE_URL + APP_PATH)
} else {
  // CICD environment
  BASE_URL = `https://${HOSTNAME}:4447/` // port from inside containers is not 44471/2
  APP_PATH = 'addons/webgui-dev/app/'
  console.log('We are in CICD: ' + BASE_URL + APP_PATH)
}

export default defineConfig({
  use: {
    baseURL: `${BASE_URL}${APP_PATH}`,
    browserName: 'chromium',
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      args: ['--disable-web-security'],
    },
  },
  testDir: './tests',
  reporter: 'list',
  timeout: 5 * 60 * 1000, // 5 minutes per test
  fullyParallel: true,
  workers: 4,
})
