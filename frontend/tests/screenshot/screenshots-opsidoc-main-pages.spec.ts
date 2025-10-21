/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { test, type Locator, type Page } from '@playwright/test'
import {
  toggleTheme,
  selectLanguage,
  takeFullPageScreenshot,
  login,
  selectHost,
  connectTerminal,
} from '../shared/utils'
//import { setupMockRoutes } from '../shared/mock/mocks'
//import { themes, languages } from '../shared/constants'
import { themes, languages } from '../shared/constants'
const screenshotPath = 'screenshots/opsidoc/'
//const themes = ['light'] // debugging
// Reset storage state for this file to avoid being authenticated
const existingClientId = 'nb-00023.acme.corp' // avoid using this (better use the ones which definitly exists on page e.g. by selecting first table row..)
const realClientId = 'wk-00037.acme.corp'

interface IElement {
  path: string

  datatestid?: string
  locator?: string
  fullPage?: boolean

  // helpers
  wrapper?: string // optional wrapper for locator
  rowId?: string // for dynamic locators

  gotoUrl?: string
  gotoForce?: boolean // whether to force goto even if already on that page (needed if only query params changed)
  preScreenshot?: (page: Page, data: IElement) => Promise<void>
  postScreenshot?: (page: Page, data: IElement) => Promise<void>
  getLocator?: (page: Page, data: IElement) => Promise<string>
}

async function doLogin(page: Page, theme: string, language: string) {
  await page.goto('login/', {
    waitUntil: 'networkidle',
    timeout: 60000,
  })
  await toggleTheme(page, theme as 'light' | 'dark')
  await selectLanguage(page, language)
  await login(page)
}
test.describe('Login Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test.use({ locale: language })
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        page,
      }) => {
        //await doLogin(page, theme, language)
        const elementsToScreenshot: IElement[] = [
          {
            datatestid: 'login-card',
            gotoUrl: 'login/',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-login.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              //await toggleTheme(page, theme)
              //await selectLanguage(page, language)
            },
          },
          {
            datatestid: 'language-dropdown',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-language.png`,
            postScreenshot: async (page: Page, data: IElement) => {
              await login(page)
            },
          },
          // logged in
          // adminpage
          {
            gotoUrl: '/admin/#addons',
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-install.png`,
          },
        ]
        await runScreenshots(page, elementsToScreenshot)
      })
    }
  }
})

test.describe('Dark Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test.use({ locale: language })
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        page,
      }) => {
        await doLogin(page, 'dark', language)

        const elementsToScreenshot: IElement[] = [
          {
            fullPage: true,
            gotoUrl: 'clients/',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-theme-dark.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              console.log('Clicking on Products button1')
              await page.getByTestId('clients-products-button').first().click()
              await page.waitForTimeout(5000)
              console.log('Clicked on Products button2')
            },
          },
        ]
        await runScreenshots(page, elementsToScreenshot)
      })
    }
  }
})

test.describe('QuickPanel Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test.use({ locale: language })
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        page,
      }) => {
        await doLogin(page, theme, language)

        const elementsToScreenshot: IElement[] = [
          {
            datatestid: 'BQuickPanel',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-quickpanel.png`,
          },
          {
            //datatestid: 'tab-infoselections-content',
            locator: '#pane-infoselections',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-quickpanel-tab-selection-content.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              const loc = (data.locator || '').replace('pane-', 'tab-')
              const el = page.locator(loc)
              await el.waitFor()
              await el.click()
              await el.screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-quickpanel-tab-selection.png`,
              })
              await page.waitForTimeout(1000)
            },
          },
          {
            locator: '#pane-depots',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-quickpanel-tab-depots-content.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              const loc = (data.locator || '').replace('pane-', 'tab-')
              const el = page.locator(loc)
              await el.waitFor()
              await el.click()
              await el.screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-quickpanel-tab-depots.png`,
              })
              await page.waitForTimeout(1000)
            },
          },
          {
            locator: '#pane-product-group',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-quickpanel-tab-products-content.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              const loc = (data.locator || '').replace('pane-', 'tab-')
              const el = page.locator(loc)
              await el.waitFor()
              await el.click()
              await el.screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-quickpanel-tab-products.png`,
              })
              await page.waitForTimeout(1000)
            },
          },
          {
            locator: '#pane-client-group',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-quickpanel-tab-clients-content.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              const loc = (data.locator || '').replace('pane-', 'tab-')
              const el = page.locator(loc)
              await el.waitFor()
              await el.click()
              await el.screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-quickpanel-tab-clients.png`,
              })
              await page.waitForTimeout(1000)
            },
          },
          {
            locator: '.dialog-products-quickaction-modal .el-dialog',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productaction-fast.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              const btn = page.getByTestId('btn-product-quick-actions')
              await btn.waitFor()
              await btn.screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-quickpanel-productaction.png`,
              })
              await btn.click()

              // select InstallationStatus
            },
          },
        ]

        await runScreenshots(page, elementsToScreenshot)
      })
    }
  }
})

test.describe('General Table Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test.use({ locale: language })
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        page,
      }) => {
        await doLogin(page, theme, language)

        const elementsToScreenshot: IElement[] = [
          // elements in the toolbar of clients page
          {
            gotoUrl: 'clients/',
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-main-layout.png`,
          },
          {
            datatestid: 'btn-clearSelection',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonclearselect.png`,
          },
          {
            datatestid: 'clients-products-button',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonproducts.png`,
          },

          // elements in the client table row/s
          {
            datatestid: 'btn-config',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonconfig.png`,
          },
          {
            datatestid: 'btn-log',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonlog.png`,
          },
          {
            datatestid: 'btn-refresh',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-table-refresh.png`,
          },
          {
            locator: '.toolbar-left .el-input',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-table-filter.png`,
          },
          {
            datatestid: 'btn-columns',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-table-settings.png`,
            postScreenshot: async (page: Page, data: IElement) => {
              // close popup
              await page.getByTestId('btn-columns').click()
              await page.waitForTimeout(2000)
              //const dtId = 'table-column-settings'
              //const elemn = page.getByTestId(dtId).first()
              const elem = page.locator('.el-popper.el-tooltip .el-dropdown__list').first()
              await elem.waitFor()
              await elem.screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-table-settings-content.png`,
              })
            },
          },
        ]
        await runScreenshots(page, elementsToScreenshot)
      })
    }
  }
})

test.describe('Server Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test.use({ locale: language })
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        page,
      }) => {
        await doLogin(page, theme, language)
        await page.getByTestId('menu-quickpanel').click()

        const elementsToScreenshot: IElement[] = [
          {
            gotoUrl: 'servers/',
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-servers.png`,
          },
          //{
          //  gotoUrl: 'servers/config',
          //  fullPage: true,
          //  path: `${screenshotPath}/${theme}/${language}/opsi-webgui-servers-config.png`,
          //}

          {
            fullPage: true,
            gotoUrl: `servers/`,
            //path: `${screenshotPath}/${theme}/${language}/opsi-webgui-servers-config.png`,
            //opsi-webgui-server-attribute
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-servers-attributes.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              await page.getByTestId('btn-config').first().click()
              await page.waitForTimeout(2000)
              await page.locator('#tab-attr').click()
              await page
            },
          },
        ]
        await runScreenshots(page, elementsToScreenshot)
      })
    }
  }
})

test.describe('Clients Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test.use({ locale: language })
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        page,
      }) => {
        await doLogin(page, theme, language)
        await page.getByTestId('menu-quickpanel').click()

        const elementsToScreenshot: IElement[] = [
          // ORDER MATTERS!
          {
            gotoUrl: 'clients/',
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clients.png`,
          },
          {
            locator: '[data-testid^="wrapper-clientactions-"]',
            wrapper: '[data-testid^="wrapper-clientactions-"]', // actually the same as locator
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonclientactions.png`,
            postScreenshot: async (page: Page, data: IElement) => {
              if (data.wrapper === undefined)
                throw new Error('wrapper must be defined for clientactions button')
              // get any rows actions button and click on it (to open popup with concrete actions)
              const elClientAction = page.locator(data.wrapper).first()
              await elClientAction.click()
              const clientDataTestId = await elClientAction.getAttribute('data-testid')
              if (!clientDataTestId)
                throw new Error('Failed to get clientDataTestId from btn-clientactions')

              const wrapperLocator = `[data-testid="${clientDataTestId}"]`
              console.log('Using wrapperLocator: ', wrapperLocator)
              const wrapperElement = page.locator(wrapperLocator)
              wrapperElement.click()

              const contentLocator = clientDataTestId.replace(
                'wrapper-clientactions-',
                'content-clientactions-'
              ) // unsorted list inside popover
              await screenshot_datatestid(
                page,
                contentLocator,
                `${screenshotPath}/${theme}/${language}/opsi-webgui-clientactions.png`
              )
            },
          },
          // single action contents
          {
            //locator: '.popover-deployClientAgent',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clientdeployagent.png`,
            getLocator: async (page: Page, data: IElement) => {
              data.rowId = await getRowId(
                page,
                '[data-testid^="wrapper-clientactions-"]',
                'deployClientAgent',
                `${screenshotPath}/${theme}/${language}/opsi-webgui-buttondeployagent.png`
              )
              return `.popover-deployClientAgent-${data.rowId.replace(/\./g, '\\.')}`
            },
            postScreenshot: async (page: Page, data: IElement) => {
              const el = page.getByTestId(`popover-deployClientAgent-${data.rowId}-cancel`).first()
              await el.waitFor({ state: 'visible' })
              await el.click()
              await el.waitFor()
            },
          },
          {
            // datatestid: 'popover-reboot',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clientreboot.png`,
            getLocator: async (page: Page, data: IElement) => {
              data.rowId = await getRowId(
                page,
                '[data-testid^="wrapper-clientactions-"]',
                'reboot',
                `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonreboot.png`
              )
              return `.popover-reboot-${data.rowId.replace(/\./g, '\\.')}`
            },
            postScreenshot: async (page: Page, data: IElement) => {
              //await page.getByTestId(`popover-reboot-${data.rowId}-cancel`).first().click()
              const el = page.getByTestId(`popover-reboot-${data.rowId}-cancel`).first()
              await el.waitFor({ state: 'visible' })
              await el.click()
              await el.waitFor()
            },
          },
          {
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clientdeletion.png`,
            getLocator: async (page: Page, data: IElement) => {
              data.rowId = await getRowId(
                page,
                '[data-testid^="wrapper-clientactions-"]',
                'delete',
                `${screenshotPath}/${theme}/${language}/opsi-webgui-buttondeletion.png`
              )
              return `.popover-delete-${data.rowId.replace(/\./g, '\\.')}`
            },
            postScreenshot: async (page: Page, data: IElement) => {
              //await page.getByTestId(`popover-delete-${data.rowId}-cancel`).first().click()
              const el = page.getByTestId(`popover-delete-${data.rowId}-cancel`).first()
              await el.waitFor({ state: 'visible' })
              await el.click()
              await el.waitFor()
            },
          },
          {
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clientnotify.png`,
            getLocator: async (page: Page, data: IElement) => {
              data.rowId = await getRowId(
                page,
                '[data-testid^="wrapper-clientactions-"]',
                'notify',
                `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonnotify.png`
              )
              return `.popover-notify-${data.rowId.replace(/\./g, '\\.')}`
            },
            postScreenshot: async (page: Page, data: IElement) => {
              //await page.getByTestId(`popover-notify-${data.rowId}-cancel`).first().click()
              const el = page.getByTestId(`popover-notify-${data.rowId}-cancel`).first()
              await el.waitFor({ state: 'visible' })
              await el.click()
              await el.waitFor()
            },
          },
          {
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clientondemand.png`,
            getLocator: async (page: Page, data: IElement) => {
              data.rowId = await getRowId(
                page,
                '[data-testid^="wrapper-clientactions-"]',
                'onDemand',
                `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonondemand.png`
              )
              return `.popover-onDemand-${data.rowId.replace(/\./g, '\\.')}`
            },
            postScreenshot: async (page: Page, data: IElement) => {
              const el = page.getByTestId(`popover-onDemand-${data.rowId}-cancel`).first()
              await el.waitFor({ state: 'visible' })
              await el.click()
              await el.waitFor()
            },
          },

          // other client pages
          {
            datatestid: 'page-content',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clientclone.png`,
            gotoUrl: `clients/clone/${existingClientId}`,
          },

          //{ // fail cause need at least one client
          //  gotoUrl: 'clients/config',
          //  fullPage: true,
          //  path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clients-config.png`,
          //}

          {
            fullPage: true,
            gotoUrl: `clients/`,
            gotoForce: true,
            //path: `${screenshotPath}/${theme}/${language}/opsi-webgui-servers-config.png`,
            //opsi-webgui-server-attribute
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clients-attributes.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              await page
                .getByTestId('btn-clone')
                .first()
                .screenshot({
                  path: `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonclone.png`,
                })
              await page.getByTestId('btn-config').first().click()
              await page.waitForTimeout(2000)
              await page.locator('#tab-attr').click()
              await page
            },
          },

          {
            datatestid: 'page-content',
            gotoUrl: `clients/logs/${realClientId}`,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clientlogs.png`,
          },
          {
            datatestid: 'page-content',
            gotoUrl: `clients/create/`,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-clientcreation.png`,
          },
        ]

        await runScreenshots(page, elementsToScreenshot)
      })
    }
  }
})

test.describe('Groups Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test.use({ locale: language })
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        context,
        page,
      }) => {
        await doLogin(page, theme, language)
        await page.getByTestId('menu-quickpanel').click()

        const elementsToScreenshot: IElement[] = [
          {
            gotoUrl: 'groups/client-group/',
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-groups.png`,
          },
        ]
        await runScreenshots(page, elementsToScreenshot)
      })
    }
  }
})

test.describe('Products Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test.use({ locale: language })
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        page,
      }) => {
        await doLogin(page, theme, language)
        await page.getByTestId('menu-quickpanel').click()
        const selectClient = async (page: Page) => {
          // select any client by class ".el-table__row", use third row to avoid header
          const rowC = page.locator('.el-table__row').nth(3)
          const cell = rowC.locator('td .p-checkbox-input').first()

          await cell.waitFor()
          await cell.setChecked(true)
          await page.waitForTimeout(2000)
        }
        const elementsToScreenshot: IElement[] = [
          {
            gotoUrl: 'products/LocalbootProduct',
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-products.png`,
          },
          {
            gotoUrl: 'clients/',
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-products-clients.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              await page.getByTestId('clients-products-button').first().click()
              await page.waitForTimeout(5000)
            },
          },
          // multiple product on client states and version icons
          {
            gotoUrl: 'zdebug/products',
            datatestid: 'success-text-installed',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-installed.png`,
            postScreenshot: async (page: Page, data: IElement) => {
              await page.getByTestId('success-icon-success').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-successful.png`,
              })
              await page.getByTestId('warn-text-unknown').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-unknown.png`,
              })
              await page.getByTestId('danger-icon-failed').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-failed.png`,
              })

              await page.getByTestId('danger-icon-unequal').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-unequal-danger.png`,
              })
              await page.getByTestId('success-icon-unequal').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-unequal-success.png`,
              })
              await page.getByTestId('warn-icon-unequal').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-unequal-warning.png`,
              })

              //versions:
              await page.getByTestId('depot-notall').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-version-server-star.png`,
              })
              await page.getByTestId('depot-unequal').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-version-server-unequal.png`,
              })
              await page.getByTestId('client-unequal').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-version-clientunequal.png`,
              })
              await page.getByTestId('client-outdated').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productstat-version-clientoutdated.png`,
              })
            },
          },
          {
            gotoUrl: 'clients/',
            gotoForce: true,
            locator: '.el-dialog__body', // ondemand modal
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-dialog-products-ondemand.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              // select any client by class ".el-table__row", use third row to avoid header
              await selectClient(page)
              await goto(page, 'products/LocalbootProduct', true)
              await page.waitForTimeout(2000)

              // screenshot of Headers ActionRequest
              const arHeader = page.locator('.column-actionRequest .p-select').first()
              await arHeader.waitFor()
              await arHeader.click()
              await page.waitForTimeout(1000)
              await page.locator('.tc-product-request-select-none').screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productactionreq.png`,
              })

              // store screenshot of ondemand btn and dialog
              const btnOnDemand = page.getByTestId('btn-products-save-on-demand').first()
              await btnOnDemand.screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonproducts-ondemand.png`,
              })
              await btnOnDemand.click()
            },
          },
          {
            gotoUrl: 'clients/',
            gotoForce: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-products-changes.png`,
            locator: '.dialog-products-save-modal', // save&ondemand modal
            preScreenshot: async (page: Page, data: IElement) => {
              // select any client by class ".el-table__row", use third row to avoid header
              await selectClient(page)
              await goto(page, 'products/LocalbootProduct', true)
              await page.waitForTimeout(2000)

              // open actionRequest-Select
              const cellAR = page.locator('.column-actionRequest .p-select').nth(1) // first select is in header row
              await cellAR.waitFor()
              await cellAR.click()
              await page.waitForTimeout(2000)

              // select first option
              const options = page.locator('.p-select-overlay .p-select-option').nth(0) // first option
              await options.waitFor()
              await options.click()
              await page.waitForTimeout(2000)

              // screenshot of save btn
              const btnSave = page.getByTestId('btn-products-save-on-demand').first()
              await btnSave.screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-buttonproducts-save.png`,
              })
              await btnSave.click()
              await page.waitForTimeout(2000)

              // screenshot dialog
            },
          },
          {
            // properties etc
            gotoUrl: 'clients/',
            gotoForce: true,
            datatestid: 'page-side-content',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productprop.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              //await selectClient(page)
              await goto(page, 'products/LocalbootProduct', true)
              await page.waitForTimeout(2000)

              // clickProductSettings
              const filter = page.getByTestId('input-filter').first()
              await filter.waitFor()
              await filter.fill('l-desktop')
              await page.waitForTimeout(2000)

              await page.getByTestId('btn-config').nth(0).click()

              // tab-dependencies
              const tabDependencies = page.locator('#tab-dependencies')
              await tabDependencies.waitFor()
              await tabDependencies.click()
              await page.waitForTimeout(2000)
              await page.screenshot({
                path: `${screenshotPath}/${theme}/${language}/opsi-webgui-productdependency.png`,
              })

              // tab properties
              const tabProperties = page.locator('#tab-properties')
              await tabProperties.waitFor()
              await tabProperties.click()
              await page.waitForTimeout(2000)
            },
          },
        ]
        await runScreenshots(page, elementsToScreenshot)
      })
    }
  }
})

test.describe('System Page', () => {
  for (const theme of themes) {
    for (const language of languages) {
      test.use({ locale: language })
      test(`${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${language.toUpperCase()}`, async ({
        page,
      }) => {
        await doLogin(page, theme, language)
        await page.getByTestId('menu-quickpanel').click()

        const elementsToScreenshot: IElement[] = [
          {
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-admin-admin.png`,
            gotoUrl: 'admin/general',
          },
          {
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-admin-terminal.png`,
            gotoUrl: 'admin/terminal',
            preScreenshot: async (page: Page, data: IElement) => {
              //await page.getByTestId('terminal-connect-button').first().click()
              // TODO... click on connect
            },
          },
          {
            fullPage: true,
            gotoUrl: 'admin/diagnostics/?id=health',
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-admin-healthcheck.png`,
            preScreenshot: async (page: Page, data: IElement) => {
              await page.waitForTimeout(1000)
            },
          },
          {
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-admin-diagnostics.png`,
            gotoUrl: 'admin/diagnostics/?id=all',
            preScreenshot: async (page: Page, data: IElement) => {
              await page.locator('#tab-all').first().click()
              await page.waitForTimeout(1000)
            },
          },

          {
            fullPage: true,
            path: `${screenshotPath}/${theme}/${language}/opsi-webgui-admin-modules.png`,
            gotoUrl: 'admin/modules',
            preScreenshot: async (page: Page, data: IElement) => {
              await page.waitForTimeout(1000)
            },
          },
        ]

        await runScreenshots(page, elementsToScreenshot)
      })
    }
  }
})

async function goto(page: Page, urlpath: string, force: boolean = false) {
  const urlpathpart = urlpath.split('?')[0] // without query params
  if (!page.url().includes(urlpathpart) || force) {
    await page.goto(urlpath, {
      waitUntil: 'networkidle',
      timeout: 60000,
    })
    try {
      await page.waitForURL(`**/${urlpath}**`, { timeout: 60000 })
      //await page.waitForTimeout(10000)
    } catch (e) {}

    if (!page.url().includes(urlpathpart)) {
      console.log('Current URL: ', page.url(), ', expected to include: ', urlpathpart)
      throw new Error(`Failed to navigate to ${urlpath} page`)
    }
    console.log('Navigated to: ', page.url())
  }
}

async function getRowId(page: Page, wrapper: string, action: string, path: string) {
  // optionally returns new locator to take screenshot of

  // get any rows actions button and click on it (to open popup with concrete actions)
  const elClientAction = page.locator(wrapper).first()
  await elClientAction.waitFor()
  await elClientAction.click()
  const clientDataTestId = await elClientAction.getAttribute('data-testid')
  if (!clientDataTestId) throw new Error('Failed to get clientDataTestId from btn-clientactions')

  const id = clientDataTestId.replace('wrapper-clientactions-', '')
  console.log('Using client id: ', id)

  const wrapperLocator = `[data-testid="${clientDataTestId}"]`
  console.log('Using wrapperLocator: ', wrapperLocator)
  const wrapperElement = page.locator(wrapperLocator)
  await wrapperElement.waitFor()
  await wrapperElement.click()

  // click on specific action button inside popover
  const contentLocator = `content-clientactions-${id}` // unsorted list inside popover
  const btnAction = page.getByTestId(contentLocator).getByTestId(`popover-${action}-button`)
  await btnAction.waitFor()

  await screenshot_element(page, btnAction, path)
  await btnAction.click()
  //await page.waitForTimeout(2000)
  return `${id}` as string
}

async function runScreenshots(page: Page, data: IElement[]) {
  for (const element of data) {
    // before takeing screenshot
    if (element.gotoUrl !== undefined && typeof element.gotoUrl === 'string') {
      await goto(page, element.gotoUrl, element.gotoForce)
    }
    if (element.preScreenshot !== undefined && typeof element.preScreenshot === 'function') {
      console.log(
        `Executing preScreenshot for element with ${element.datatestid || element.locator || element.path}`
      )
      await element.preScreenshot(page, element)
    }

    // get Element and take screenshot
    if (
      (element.locator !== undefined || element.datatestid !== undefined) &&
      element.getLocator !== undefined
    ) {
      throw new Error('Element cannot have both locator/datatestid _and_ getLocator defined')
    }
    if (element.getLocator !== undefined && typeof element.getLocator === 'function') {
      console.log('Executing `getLocator`')
      const newLocator: string = await element.getLocator(page, element)

      if (newLocator === undefined || typeof newLocator !== 'string')
        throw new Error('getLocator must return a string locator')
      if (newLocator.length === 0) throw new Error('getLocator must return a non-empty string')
      element.locator = newLocator
      await page.locator(newLocator).waitFor()
      // sleep 200 ms
    }
    await page.waitForTimeout(1000) // wait a bit for animations etc.
    // Screenshots
    if (element.locator !== undefined && typeof element.locator === 'string') {
      console.log(`Taking screenshot of element with locator="${element.locator}"`)
      await screenshot_selector(page, element.locator, element.path)
    } else if (element.datatestid !== undefined && typeof element.datatestid === 'string') {
      console.log(`Taking screenshot of element with data-testid="${element.datatestid}"`)
      await screenshot_datatestid(page, element.datatestid, element.path)
    } else if (element.fullPage !== undefined && element.fullPage === true) {
      console.log(`Taking full page screenshot`)
      await takeFullPageScreenshot(page, element.path)
    } else throw new Error('Element must have either locator or datatestid defined')
    // postScreenshot
    if (element.postScreenshot !== undefined && typeof element.postScreenshot === 'function') {
      console.log(
        `Executing postScreenshot for element with ${element.datatestid || element.locator}`
      )
      await element.postScreenshot(page, element)
      await page.waitForTimeout(2000)
    }
  }
}

async function screenshot_datatestid(page: Page, dtid: string, path: string) {
  await screenshot_selector(page, `[data-testid="${dtid}"]`, path)
}

async function screenshot_selector(page: Page, selector: string, path: string) {
  var el = page.locator(selector)
  // if its a list of elements, take the first one
  if ((await el.count()) > 1) el = el.first()
  await el.waitFor({ state: 'visible' })
  await el.screenshot({ path })
}

async function screenshot_element(page: Page, element: Locator, path: string) {
  var el = element
  // if its a list of elements, take the first one
  if ((await el.count()) > 1) el = el.first()
  await el.waitFor({ state: 'visible' })
  await el.screenshot({ path })
}
