// const { test, expect } = require('@playwright/test')
import { test, expect } from '@playwright/test'
// const { callStoryId } = require('../../.utils/playwright/pw-story-call')
import { callStory2Id } from '../../tests-configs/playwright/utils/pw-story-call'

// test.use({
//   colorScheme: 'dark'
// });

test.describe('snapshot', () => {
  test('btn-ep-light', async ({ page }) => {
    await callStory2Id(page, 'button', 'btn-story-vue', 0)
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForSelector('.histoire-generic-render-story > div')

    await expect(await page.screenshot()).toMatchSnapshot('BTN-ep-light.png')
  })
  test('btn-ep-dark', async ({ page }) => {
    await callStory2Id(page, 'button', 'btn-story-vue', 0)
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForSelector('.histoire-generic-render-story > div')

    await expect(await page.screenshot()).toMatchSnapshot('BTN-ep-dark.png')
  })
  test('btn-bv-light', async ({ page }) => {
    await callStory2Id(page, 'button', 'btn-story-vue', 1)
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForSelector('.histoire-generic-render-story > div')

    await expect(await page.screenshot()).toMatchSnapshot('BTN-bv-light.png')
  })
  test('btn-bv-dark', async ({ page }) => {
    await callStory2Id(page, 'button', 'btn-story-vue', 1)
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForSelector('.histoire-generic-render-story > div')

    await expect(await page.screenshot()).toMatchSnapshot('BTN-bv-dark.png')
  })
})
