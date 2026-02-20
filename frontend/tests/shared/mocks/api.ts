/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { MOCK_DATA_URL, defaultResponseHeaders } from '../constants'
import type { Depot, Client, Product, Host } from './types'
import type { Page, Route } from '@playwright/test'
import {
  getDepots,
  getDepotList,
  getClients,
  getClientsList,
  getHostParam,
  getProducts,
  getHostGroups,
} from './helpers'

import { serverDiagnostic } from './data'

let mockData:
  | {
      meta: { server_id: string }
      objects: {
        User: { id: string }[]
        Host: Host[]
        Config: { [key: string]: unknown }[] // Replace any[] with object array
        Product: Product[]
        Group: { [key: string]: unknown }[] // Replace any[] with object array
      }
      config_files: unknown
    }
  | undefined
let serverId: string = ''
let userId: string = ''
let userConfig: { user: string; configuration: unknown } = { user: '', configuration: {} }
let serverObjectList: Depot[] = []
let serverList: string[] = []
let clientObjectList: Client[] = []
let clientList: string[] = []
let productObjectList: Product[] = []
let hostParameters: { general: { [key: string]: unknown }[] } = { general: [] }
let hostGroups: { [key: string]: unknown }[] = []

export const fetchMockData = async (): Promise<void> => {
  if (mockData) return

  try {
    const response = await fetch(MOCK_DATA_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch mock data: ${response.statusText}`)
    }

    mockData = await response.json()
    serverId = mockData.meta.server_id
    userId = mockData.objects.User[0].id
    userConfig = { user: userId, configuration: mockData.config_files }
    serverObjectList = getDepots(mockData.objects.Host)
    serverList = getDepotList(mockData.objects.Host)
    clientObjectList = getClients(mockData.objects.Host)
    clientList = getClientsList(mockData.objects.Host)
    hostParameters = getHostParam(mockData.objects.Config)
    productObjectList = getProducts(mockData.objects.Product)
    hostGroups = getHostGroups(mockData.objects.Group)
  } catch (error) {
    console.error('Error fetching mock data:', error)
    throw error
  }
}

export const addMockRoute = async (page: Page, url: string, response: unknown) => {
  await page.unroute(url)
  await page.route(url, (route: Route) => {
    route.fulfill({
      status: 200,
      headers: {
        ...defaultResponseHeaders,
        'x-opsi-worker-id': `${serverId}:1`,
        'x-opsi-user-id': `user:${userId}`,
      },
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

export const setupMockRoutes = async (
  page: Page,
  isLoggedIn: boolean = false,
  customRoutes: Array<{ url: string; response: unknown }> = []
) => {
  await fetchMockData()
  await page.unroute('**/api/**')

  const defaultRoutes = [
    { url: '**/webgui/api/**', response: {} },
    { url: '**/api/user/opsiserver', response: { result: serverId } },
    ...(isLoggedIn
      ? [
          { url: '**/api/auth/login', response: { result: 'Login success' } },
          {
            url: '**/api/user/configuration',
            response: userConfig,
          },
          { url: '**/api/opsidata/server/disabled-features', response: [] },
          {
            url: '**/addons/webgui/api/opsidata/depots?**',
            response: serverObjectList,
          },
          {
            url: '**/addons/webgui/api/opsidata/depot_ids',
            response: serverList,
          },
          {
            url: '**/addons/webgui/api/opsidata/clients?**',
            response: clientObjectList,
          },
          {
            url: '**/addons/webgui/api/opsidata/depots/clients?**',
            response: clientList,
          },
          {
            url: '**/addons/webgui/api/opsidata/config/objects/**',
            response: hostParameters,
          },
          {
            url: '**/addons/webgui/api/opsidata/products?**',
            response: productObjectList,
          },
          {
            url: '**/addons/webgui/api/opsidata/hosts/groups?**',
            response: hostGroups,
          },
          {
            url: '**/addons/webgui/api/opsidata/server/diagnostic',
            response: serverDiagnostic,
          },
        ]
      : []),
  ]

  const routesToMock = customRoutes.length > 0 ? customRoutes : defaultRoutes
  for (const { url, response } of routesToMock) {
    await page.route(url, (route: Route) => {
      route.fulfill({
        status: 200,
        headers: {
          ...defaultResponseHeaders,
          'x-opsi-worker-id': `${serverId}:1`,
          'x-opsi-user-id': `user:${userId}`,
        },
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })
  }
}

export { serverId }
