// const wait = function (ms, s) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

import { expect, type Page } from '@playwright/test'

export const apiMock = (page: Page, apiPath: string, response: any) =>
  page.route(apiPath, (route) =>
    route.fulfill({
      status: 200,
      headers: {
        'access-control-allow-origin': 'https://localhost:8888',
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': '*',
        'access-control-allow-methods': '*',
      },
      contentType: 'application/json',
      body: JSON.stringify(response),
    }),
  )

// export const callStoryIdMock = async (page: Page, fullId: string, id: string, path: string, result: any) => {
//   await this.callStoryId(page, fullId, id, path, result)
//   await page.unroute(path)
//   await apiMock(page, path, result)
// }
export const callHistoreVariantById = async (
  page: Page,
  folder: string,
  filename: string,
  variantId: number | string,
) => {
  const x = `https://localhost:6006/__sandbox.html?storyId=components-${folder}-${filename}&variantId=components-${folder}-${filename}-${variantId}`
  await page.goto(x)
}
export const callHistoreVariantByName = async (
  page: Page,
  folder: string,
  filename: string,
  variantName: string = 'default',
) => {
  const x = `https://localhost:6006/__sandbox.html?storyId=components-${folder}-${filename}&variantId=_${variantName}`
  await page.goto(x)
}
export const callHistoireStory = async (
  page: Page,
  folder: string,
  filename: string,
) =>
  await page.goto(
    `https://localhost:6006/story/components-${folder}-${filename}`,
  )

const _cssClassVariantName = '.histoire-story-viewer .htw-truncate'
const _cssClassVariantContent = '.histoire-generic-render-story > div'
export const simpleScreenshotTest = async (
  page: Page,
  componentFolder: string,
  filename: string,
  screenshotPrefix: string,
  dataTestid: string | undefined = undefined,
  afterDatatestid:
    | undefined
    | ((page: Page, element: any) => Promise<any>) = undefined,
  options: any = {
    cssClassVariantName: _cssClassVariantName,
    cssClassVariantContent: _cssClassVariantContent,
  },
) => {
  // First we find out how many and which variants are available
  await callHistoireStory(page, componentFolder, filename)
  await page.waitForSelector(
    options.cssClassVariantName || _cssClassVariantName,
  )
  const variantNames = await page
    .locator(options.cssClassVariantName || _cssClassVariantName)
    .allInnerTexts()

  // We test dark and light mode for each variant
  for (const theme of ['light', 'dark']) {
    // We iterate over all variants and take a screenshot
    for (let i = 0; i < variantNames.length; i++) {
      const variantName = variantNames[i]

      // setting the theme
      await page.emulateMedia({ colorScheme: theme as 'light' | 'dark' })

      // open the variant in new tab (full paged)
      if (variantName === 'default') {
        await callHistoreVariantByName(
          page,
          componentFolder,
          filename,
          variantName,
        )
      } else {
        await callHistoreVariantById(page, componentFolder, filename, i)
      }

      // Find the main content of the variant
      const storySelector =
        options.cssClassVariantContent || _cssClassVariantContent
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await page.waitForSelector(storySelector)
      let element = await page.locator(storySelector)

      // If we have a data-testid we use it to find the specific element
      if (dataTestid) {
        const dtid = `[data-testid="${dataTestid}"]`
        element = await page.locator(dtid)
      }
      if (afterDatatestid) {
        const x = await afterDatatestid(page, element)
        if (x) element = x
      }

      // Take the screenshot
      await expect(await element.screenshot()).toMatchSnapshot(
        screenshotPrefix + '-' + variantName + '-' + theme + '.png',
      )
    }
  }
}

// export const callStory = (page: Page, path: string) => page.goto(`http://localhost:3003/?path=${path}`)

export default {
  apiMock,
  // callHistoreVariantById,
  // callHistoreVariantByName,
  // callHistoireStory,
  simpleScreenshotTest,
  // callStoryIdMock,
  // callStory
}
