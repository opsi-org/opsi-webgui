/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { expect, type Page } from '@playwright/test'

export const callHistoreVariantById = async (
  page: Page,
  folder: string,
  filename: string,
  variantId: number | string
) => {
  const x = `https://localhost:6006/__sandbox.html?storyId=components-${folder}-${filename}&variantId=components-${folder}-${filename}-${variantId}`
  await page.goto(x)
}

export const callHistoreVariantByName = async (
  page: Page,
  folder: string,
  filename: string,
  variantName: string = 'default'
) => {
  const x = `https://localhost:6006/__sandbox.html?storyId=components-${folder}-${filename}&variantId=_${variantName}`
  await page.goto(x)
}

export const callHistoireStory = async (page: Page, folder: string, filename: string) =>
  await page.goto(`https://localhost:6006/story/components-${folder}-${filename}`)

const _cssClassVariantName = '.histoire-story-viewer .htw-truncate'
const _cssClassVariantContent = '.histoire-generic-render-story > div'

export const simpleScreenshotTest = async (
  page: Page,
  componentFolder: string,
  filename: string,
  screenshotPrefix: string,
  dataTestid: string | undefined = undefined,
  afterDatatestid: undefined | ((page: Page, element: any) => Promise<any>) = undefined,
  options: any = {
    cssClassVariantName: _cssClassVariantName,
    cssClassVariantContent: _cssClassVariantContent,
  }
) => {
  // First we find out how many and which variants are available
  await callHistoireStory(page, componentFolder, filename)
  await page.waitForSelector(options.cssClassVariantName || _cssClassVariantName)
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
        await callHistoreVariantByName(page, componentFolder, filename, variantName)
      } else {
        await callHistoreVariantById(page, componentFolder, filename, i)
      }

      // Find the main content of the variant
      const storySelector = options.cssClassVariantContent || _cssClassVariantContent
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
        screenshotPrefix + '-' + variantName + '-' + theme + '.png'
      )
    }
  }
}

export default {
  simpleScreenshotTest,
}
