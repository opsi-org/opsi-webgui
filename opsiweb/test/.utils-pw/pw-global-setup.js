// global-setup.js
const { chromium, firefox, webkit } = require('@playwright/test');

module.exports = async config => {
  const { baseURL, storageState } = config.projects[0].use;
  // for (browser in [chromium, f])
  // console.log('baseURL', baseURL)
  // console.log('storage', storageState)
  // console.log('config', config)
};