/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

export interface Configuration {
  user: string
  configuration: ConfigurationResult
}
export interface ConfigurationResult {
  read_only: boolean
  depot_access: boolean
  host_group_access: boolean
  product_group_access: boolean
  client_creation: boolean
  server_write_access: boolean
  health: {
    worst_case: 'ok' | 'warning' | 'error'
    counts: { ok: number; warning: number; error: number }
  }
  [key: string]: unknown
}
