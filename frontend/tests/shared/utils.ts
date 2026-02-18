/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { test } from '@playwright/test'
import type { BrowserContext, Page } from '@playwright/test'
import { opsiconfdSessionCookie } from '../shared/constants'

export const login = async (context: BrowserContext, page: Page) => {
  await context.addCookies(opsiconfdSessionCookie)
  await context.cookies()
  await page.waitForURL('**/app/**', { timeout: 60000 })
}

export const toggleTheme = async (page: Page, targetTheme: 'light' | 'dark') => {
  const themeToggle = page.getByTestId('theme-toggle')
  await themeToggle.waitFor({ state: 'visible' })
  const ariaLabel = await themeToggle.getAttribute('aria-label')
  const isDarkMode = ariaLabel?.includes('on')
  if ((targetTheme === 'dark' && !isDarkMode) || (targetTheme === 'light' && isDarkMode)) {
    await themeToggle.click()
  }
  await page.waitForTimeout(1000)
}

export const selectLanguage = async (page: Page, targetLanguage: 'en' | 'de') => {
  const languageDropdown = page.getByTestId('language-dropdown')
  await languageDropdown.waitFor({ state: 'visible' })
  const activeLanguage = await languageDropdown.textContent()
  if (activeLanguage?.trim().toLowerCase() === targetLanguage) {
    return
  }
  await languageDropdown.click()
  await page.waitForTimeout(500)
  const languageOption = page.getByTestId(`language-dropdown-item-${targetLanguage}`)
  await languageOption.waitFor({ state: 'visible' })
  await languageOption.click()
  await page.waitForTimeout(500)
  const updatedLanguage = await languageDropdown.textContent()
  if (!updatedLanguage?.includes(targetLanguage.toUpperCase())) {
    throw new Error(`Failed to select language: ${targetLanguage}`)
  }
}

export const selectHost = async (page: Page) => {
  const hostSelect = page.getByTestId('host-select')
  await hostSelect.waitFor({ state: 'visible' })
  await hostSelect.click()
  await page.waitForSelector('.el-select-dropdown__item', { state: 'visible' })
  const firstOption = page.locator('.el-select-dropdown__item').first()
  await firstOption.click()
  await page.waitForTimeout(1000)
}

export const connectTerminal = async (page: Page) => {
  const terminalButton = page.getByTestId('terminal-connect-button')
  await terminalButton.waitFor({ state: 'visible' })
  await terminalButton.click()
  await page.waitForTimeout(10000)
}

export const takeFullPageScreenshot = async (page: Page, path: string) => {
  await page.screenshot({ path, fullPage: true })
}

export const useHighResolutionViewport = () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 3,
  })
}
