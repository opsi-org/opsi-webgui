import { test } from '@playwright/test'
import type { BrowserContext, Page, Route } from '@playwright/test'

const opsiconfdSessionCookie = [
  {
    name: 'opsiconfd-session',
    value: 'any-value',
    domain: 'localhost',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: true,
    sameSite: 'None' as 'None' | 'Strict' | 'Lax' | undefined,
  },
]

let mockData: any
let serverName: string = ''
let userId: string = ''
let serverObjectList: any
let clientObjectList: any

const fetchMockData = async () => {
  if (!mockData) {
    const response = await fetch(
      'https://binaryindex.uib.gmbh/development/opsi-backups/opsi.acme.corp_4.3.json',
    )
    mockData = await response.json()
    serverName = mockData.meta.server_id
    userId = mockData.objects.User[0].id

    serverObjectList = mockData.objects.Host.filter(
      (host: any) =>
        host.type === 'OpsiDepotserver' || host.type === 'OpsiConfigserver',
    ).map((depot: any) => ({
      depotId: depot.id,
      type: depot.type,
      ip: depot.ipAddress || null,
      description: depot.description || '',
      selected: false,
    }))

    clientObjectList = mockData.objects.Host.filter(
      (host: any) => host.type === 'OpsiClient',
    ).map((client: any) => ({
      clientId: client.id,
      ident: client.id,
      macAddress: client.hardwareAddress || '',
      ipAddress: client.ipAddress || '',
      description: client.description || '',
      notes: client.notes || '',
      lastSeen: client.lastSeen || null,
      installationStatus_installed: 0,
      installationStatus_unknown: 1,
      actionResult_failed: 0,
      actionResult_successful: 0,
      reachable: null,
      selected: false,
      uefi: false,
      uefi_value: null,
      version_outdated: 0,
      version_outdated_netboot: 1,
    }))
  }
}

const defaultResponseHeaders = {
  'access-control-allow-origin': 'https://localhost:8888',
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers':
    'Accept,Accept-Encoding,Authorization,Connection,Content-Type,Encoding,Host,Origin,X-opsi-session-lifetime,X-Requested-With',
  'access-control-allow-methods': '*',
  'strict-transport-security': 'max-age=600; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'x-date-unix-timestamp': Date.now().toString(),
  'x-opsi-server-role': 'configserver',
  'x-opsi-auth-methods': 'password',
}

const getFreshBrowserState = async (page: Page, context: BrowserContext) => {
  await context.clearCookies()
  await context.clearPermissions()
  await page.goto('about:blank')
}

const setupMockRoutes = async (page: Page, context: BrowserContext) => {
  await getFreshBrowserState(page, context)
  await fetchMockData()
  await page.unroute('**/api/**')

  const apiResponses = [
    { url: '**/webgui/api/**', response: {} },
    { url: '**/api/user/opsiserver', response: { result: serverName } },
    { url: '**/api/auth/login', response: { result: 'Login success' } },
    {
      url: '**/api/user/configuration',
      response: { user: userId, configuration: mockData.config_files },
    },
    {
      url: '**/api/opsidata/server/disabled-features',
      response: [],
    },
    {
      url: '**/addons/webgui/api/opsidata/depots?**',
      response: serverObjectList,
    },
    {
      url: '**/addons/webgui/api/opsidata/clients?**',
      response: clientObjectList,
    },
  ]

  for (const { url, response } of apiResponses) {
    await page.route(url, (route: Route) => {
      route.fulfill({
        status: 200,
        headers: {
          ...defaultResponseHeaders,
          'x-opsi-worker-id': `${serverName}:1`,
          'x-opsi-user-id': `user:${userId}`,
        },
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })
  }
}

test('screenshots after login', async ({ page, context }) => {
  await setupMockRoutes(page, context)

  await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 })
  await context.addCookies(opsiconfdSessionCookie)
  await context.cookies()
  await page.waitForURL('**/app/**', { timeout: 60000 })
  await page.screenshot({ path: 'screenshots/opsi-webgui-clients.png' })

  await page.goto('/servers/', { waitUntil: 'networkidle', timeout: 60000 })
  await page.screenshot({ path: 'screenshots/opsi-webgui-servers.png' })
})
