/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { MOCK_DATA_URL, defaultResponseHeaders } from '../constants'
import type { Depot, Client } from './types'
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

let mockData: any
let serverId: string = ''
let userId: string = ''
let userConfig: any = {}
let serverObjectList: Depot[] = []
let serverList: string[] = []
let clientObjectList: Client[] = []
let clientList: string[] = []
let hostParameters: any = []
let productObjectList: any = []
let hostGroups: any = []

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

export const addMockRoute = async (page: Page, url: string, response: any) => {
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
  customRoutes: Array<{ url: string; response: any }> = []
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

export const mockLogs = async (page: Page, clientId: string) => {
  //await fetchMockData()
  //await page.unroute('**/api/**')

  const defaultRoutes = [
    {
      // client Logs opsidata/log?selectedClient=asdasda.uib.local&selectedLogType=instlog
      url: '**opsidata/log**',
      response: {
        result: [
          '',
          '[1] [2025-04-17 19:19:07.114] [] --',
          '[1] [2025-04-17 19:19:07.114] [] --',
          '[1] [2025-04-17 19:19:07.114] [] c:\\opsi.org\\log\\\\opsi-script-part-ryH76N7u3Q.log',
          '[1] [2025-04-17 19:19:07.115] [] opsi-script log file with encoding utf8',
          '[1] [2025-04-17 19:19:07.115] [] ssl library path: C:\\Program Files (x86)\\opsi.org\\opsi-client-agent\\opsi-script\\libssl-3.dll',
          '[1] [2025-04-17 19:19:07.115] [] ssl library path: C:\\Program Files (x86)\\opsi.org\\opsi-client-agent\\opsi-script\\libcrypto-3.dll',
          '[1] [2025-04-17 19:19:07.115] [] Load library: C:\\Program Files (x86)\\opsi.org\\opsi-client-agent\\opsi-script\\libcrypto-3.dll',
          '[1] [2025-04-17 19:19:07.115] [] Load library: C:\\Program Files (x86)\\opsi.org\\opsi-client-agent\\opsi-script\\libssl-3.dll',
          '[1] [2025-04-17 19:19:07.115] [] OpenSSL version: OpenSSL 3.0.16 11 Feb 2025',
          '[1] [2025-04-17 19:19:07.115] [] startmessage opsi-script created at CentralForm.FormCreate: 17.04.2025 19:19:06',
          '[1] [2025-04-17 19:19:07.115] [] Detected Language is:de',
          '[1] [2025-04-17 19:19:07.115] [] Loading skin from: C:\\Program Files (x86)\\opsi.org\\opsi-client-agent\\opsi-script\\skin',
          '[1] [2025-04-17 19:19:07.115] [] Called with parameter: /opsiservice\\r\\nhttps://bonifax.uib.gmbh:4447\\r\\n/clientid\\r\\nanna-t14-win.uib.local\\r\\n/username\\r\\nanna-t14-win.uib.local\\r\\n/password\\r\\n***(confidential)***\\r\\n/processproducts\\r\\nvmware-vsphere-client',
          '[1] [2025-04-17 19:19:07.115] [] Depot path from readconfig:  p:\\ 17.04.2025 19:19:06',
          '[1] [2025-04-17 19:19:07.115] [] startmessage StartProgramModes and create log: 17.04.2025 19:19:06',
          '[1] [2025-04-17 19:19:07.115] [] Compiled with FPC 3.2.2 for Win32-i386 at 11:39:50 on 2025/02/17',
          '[1] [2025-04-17 19:19:07.115] [] program mode: pmBuildPC_service',
          '[1] [2025-04-17 19:19:07.115] [] startmessage start opsi service connection: 17.04.2025 19:19:06',
          '[1] [2025-04-17 19:19:07.115] [] startmessage: opsidata initialized: 17.04.2025 19:19:06',
          '[1] [2025-04-17 19:19:07.115] [] anna-t14-win.uib.local',
          '[1] [2025-04-17 19:19:07.115] [] Starting Servicecall: backend_info',
          '[1] [2025-04-17 19:19:07.115] [] Success Servicecall: backend_info',
          '[1] [2025-04-17 19:19:07.115] [] got debug_prog: False',
          '[1] [2025-04-17 19:19:07.115] [] got debug_lib: False',
          '[1] [2025-04-17 19:19:07.115] [] got default_loglevel: 7',
          '[1] [2025-04-17 19:19:07.115] [] got force_min_loglevel: 0',
          '[1] [2025-04-17 19:19:07.115] [] got ScriptErrorMessages: False',
          '[1] [2025-04-17 19:19:07.115] [] got AutoActivityDisplay: True',
          '[1] [2025-04-17 19:19:07.115] [] got w10BitlockerSuspendOnReboot: False',
          '[1] [2025-04-17 19:19:07.115] [] got ReverseProductOrderByUninstall: True',
          '[1] [2025-04-17 19:19:07.115] [] got supressSystemEncodingWarning: False',
          '[1] [2025-04-17 19:19:07.115] [] got log_rotation_count: 8',
          '[1] [2025-04-17 19:19:07.115] [] got writeProductLogFile: False',
          '[1] [2025-04-17 19:19:07.115] [] got testSyntax: False',
          '[1] [2025-04-17 19:19:07.115] [] readConfigFromService: ok',
          '[1] [2025-04-17 19:19:07.115] [] startmessage create log: 17.04.2025 19:19:07',
          '[1] [2025-04-17 19:19:07.115] [] Cleanup old part files at 17.04.2025 19:19:07',
          '[1] [2025-04-17 19:19:07.115] [] Backup old log files at 17.04.2025 19:19:07',
          '[1] [2025-04-17 19:19:07.115] [] Initiate new log file at 17.04.2025 19:19:07',
          '[1] [2025-04-17 19:19:07.115] [] force_min_loglevel: 0',
          '[1] [2025-04-17 19:19:07.115] [] default_loglevel: 7',
          '[1] [2025-04-17 19:19:07.115] [] debug_prog: false',
          '[1] [2025-04-17 19:19:07.115] [] debug_lib: false',
          '[7] [2025-04-17 19:19:07.115] [] Testing as temp path: c:\\opsi.org\\tmp\\',
          '[7] [2025-04-17 19:19:07.116] [] Succeeded: Testing as temp path: c:\\opsi.org\\tmp\\ (17.04.2025 19:19:07)',
          '[7] [2025-04-17 19:19:07.116] [] Final: Using as temp path: c:\\opsi.org\\tmp\\',
          '[6] [2025-04-17 19:19:07.154] [] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.154] [] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.154] [] JSON Bench for getDepotId "params":["anna-t14-win.uib.local"],"id":1} Start: 19:19:07:116 Time: 00:00:00:038',
          '[6] [2025-04-17 19:19:07.178] [] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.178] [] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.178] [] JSON Bench for backend_info "params":[],"id":1} Start: 19:19:07:155 Time: 00:00:00:023',
          '[7] [2025-04-17 19:19:07.180] [] getListOfProducts:getOpsiVersion : 4.3.31.23',
          '[6] [2025-04-17 19:19:07.226] [] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.226] [] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.227] [] JSON Bench for backend_getInterface "params":[],"id":1} Start: 19:19:07:180 Time: 00:00:00:047',
          '[6] [2025-04-17 19:19:07.339] [] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.339] [] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.340] [] JSON Bench for productOnClient_getObjectsWithSequence "params":["",{"clientId":"anna-t14-win.uib.local", Start: 19:19:07:263 Time: 00:00:00:077',
          '[1] [2025-04-17 19:19:07.342] [] Processing is limited to the following products: vmware-vsphere-client',
          '[1] [2025-04-17 19:19:07.342] [] Process possible: vmware-vsphere-client',
          '[1] [2025-04-17 19:19:07.342] [] Computername:anna-t14-win.uib.local',
          '[1] [2025-04-17 19:19:07.342] [] Computername according to Environment Variable :ANNA-T14-WIN',
          '[1] [2025-04-17 19:19:07.342] [] opsi service URL https://bonifax.uib.gmbh:4447',
          '[6] [2025-04-17 19:19:07.342] [] Depot path:  p:\\',
          '[6] [2025-04-17 19:19:07.342] [] ',
          '[7] [2025-04-17 19:19:07.388] [] bootmode from registry: BKSTD',
          '[6] [2025-04-17 19:19:07.388] [] Bootmode: BKSTD',
          '[6] [2025-04-17 19:19:07.388] [] ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
          '[6] [2025-04-17 19:19:07.388] [] Resolved sequence of products (17.04.2025 19:19:07):',
          '[6] [2025-04-17 19:19:07.388] [] Product 0 \tvmware-vsphere-client : setup',
          '[6] [2025-04-17 19:19:07.388] [] ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
          '[7] [2025-04-17 19:19:07.388] [] InitProduct',
          '[6] [2025-04-17 19:19:07.414] [] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.414] [] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.415] [] JSON Bench for getProduct_hash "params":["vmware-vsphere-client","bonifax.uib.loc Start: 19:19:07:388 Time: 00:00:00:027',
          '[7] [2025-04-17 19:19:07.415] [] in TOpsi4Data.initProduct : vmware-vsphere-client',
          '[6] [2025-04-17 19:19:07.441] [] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.441] [] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.441] [] JSON Bench for productOnClient_getObjects "params":["",{"clientId":"anna-t14-win.uib.local", Start: 19:19:07:415 Time: 00:00:00:026',
          '[6] [2025-04-17 19:19:07.441] [] Actionrequest for product: vmware-vsphere-client is (original/actual): (setup / setup)',
          '[6] [2025-04-17 19:19:07.453] [vmware-vsphere-client] Actionrequest for Product: vmware-vsphere-client is: setup',
          '[6] [2025-04-17 19:19:07.482] [vmware-vsphere-client] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.482] [vmware-vsphere-client] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.483] [vmware-vsphere-client] JSON Bench for backend_getInterface "params":[],"id":1} Start: 19:19:07:453 Time: 00:00:00:030',
          '[6] [2025-04-17 19:19:07.554] [vmware-vsphere-client] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.554] [vmware-vsphere-client] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.554] [vmware-vsphere-client] JSON Bench for productPropertyState_getValues "params":["vmware-vsphere-client","","anna-t14-win Start: 19:19:07:524 Time: 00:00:00:030',
          '[7] [2025-04-17 19:19:07.554] [vmware-vsphere-client] Got ProductProperty state values',
          '[7] [2025-04-17 19:19:07.554] [vmware-vsphere-client] InitProduct',
          '[6] [2025-04-17 19:19:07.580] [vmware-vsphere-client] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.580] [vmware-vsphere-client] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.580] [vmware-vsphere-client] JSON Bench for getProduct_hash "params":["vmware-vsphere-client","bonifax.uib.loc Start: 19:19:07:554 Time: 00:00:00:026',
          '[7] [2025-04-17 19:19:07.581] [vmware-vsphere-client] in TOpsi4Data.initProduct : vmware-vsphere-client',
          '[6] [2025-04-17 19:19:07.606] [vmware-vsphere-client] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.606] [vmware-vsphere-client] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.606] [vmware-vsphere-client] JSON Bench for productOnClient_getObjects "params":["",{"clientId":"anna-t14-win.uib.local", Start: 19:19:07:581 Time: 00:00:00:025',
          '[6] [2025-04-17 19:19:07.637] [vmware-vsphere-client] HTTPSender Post succeeded',
          '[6] [2025-04-17 19:19:07.637] [vmware-vsphere-client] Server-FQDN: bonifax.uib.gmbh Server-IP: 192.168.1.14',
          '[6] [2025-04-17 19:19:07.638] [vmware-vsphere-client] JSON Bench for productOnClient_updateObject "params":[{"clientId":"anna-t14-win.uib.local","ac Start: 19:19:07:607 Time: 00:00:00:031',
          '[6] [2025-04-17 19:19:07.638] [vmware-vsphere-client] scriptname: "setup3264.ins", special path: "p:\\vmware-vsphere-client\\"',
          '[6] [2025-04-17 19:19:07.638] [vmware-vsphere-client] Using new Depot path:  p:\\',
          '[7] [2025-04-17 19:19:07.781] [vmware-vsphere-client] Load from Unicode file',
          '[7] [2025-04-17 19:19:07.820] [vmware-vsphere-client] Load from file with encoding: system',
          '[7] [2025-04-17 19:19:07.821] [vmware-vsphere-client] Load from file with encoding: cp1252',
          '[1] [2025-04-17 19:19:07.821] [vmware-vsphere-client] ',
          '[1] [2025-04-17 19:19:07.821] [vmware-vsphere-client] ============ Version 4.12.17.2 script "p:\\vmware-vsphere-client\\setup3264.ins"',
          '[1] [2025-04-17 19:19:07.821] [vmware-vsphere-client]              used script encoding: cp1252',
          '[1] [2025-04-17 19:19:07.821] [vmware-vsphere-client]              used system encoding: cp1252',
          '[1] [2025-04-17 19:19:07.821] [vmware-vsphere-client]              start: 2025-04-17  19:19:07',
          '[1] [2025-04-17 19:19:07.821] [vmware-vsphere-client]              installing product: vmware-vsphere-client_6.0-1',
          '[1] [2025-04-17 19:19:07.821] [vmware-vsphere-client]              on client named    "anna-t14-win.uib.local"',
          '[1] [2025-04-17 19:19:07.821] [vmware-vsphere-client]              loggedin user    ""',
          '[1] [2025-04-17 19:19:07.823] [vmware-vsphere-client]              opsi-script running as    "SYSTEM"',
          '[1] [2025-04-17 19:19:07.823] [vmware-vsphere-client]              opsi-script running with admin privileges',
          '[1] [2025-04-17 19:19:07.823] [vmware-vsphere-client]              opsi-script running in processproducts script mode',
          '[1] [2025-04-17 19:19:07.823] [vmware-vsphere-client] Scaling for screen DPI: 96',
          '[1] [2025-04-17 19:19:07.823] [vmware-vsphere-client] executing: "C:\\Program Files (x86)\\opsi.org\\opsi-client-agent\\opsi-script\\opsi-script.exe"',
          '[1] [2025-04-17 19:19:07.823] [vmware-vsphere-client] system infos:',
        ],
      },
    },
  ]

  for (const { url, response } of defaultRoutes) {
    await page.route(url, (route: Route) => {
      route.fulfill({
        status: 200,
        /*headers: {
          ...defaultResponseHeaders,
          //'x-opsi-worker-id': `${serverId}:1`,
          //'x-opsi-user-id': `user:${userId}`,
        },*/
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })
  }
}

export { serverId }
