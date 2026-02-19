/**
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2025
 * All rights reserved.
 * License: AGPL-3.0
 */

export type ServerClientType = 'servers' | 'clients'

// Used for group tree selection in UI
export const GROUPTREE_CLIENTGROUP = 'client-group'
export const GROUPTREE_PRODGROUP = 'product-group'
export type GroupTreeType =
  | typeof GROUPTREE_CLIENTGROUP
  | typeof GROUPTREE_PRODGROUP
  | 'infoselections'
  | 'depots'

// Used for health/diagnostics tab selection
export type HealthTabType = 'healthcheck' | 'all'
