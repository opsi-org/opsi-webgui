/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

export const MOCK_DATA_URL =
  'https://binaryindex.uib.gmbh/development/opsi-backups/opsi.acme.corp_4.3.json'

export const themes = ['light', 'dark'] as const
export const languages = ['en', 'de'] as const

export const opsiconfdSessionCookie = [
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

export const defaultResponseHeaders = {
  'access-control-allow-origin': 'https://localhost:3000',
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
