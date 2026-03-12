/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Comprehensive API types for OPSI WebGUI
*/

// Re-export existing types
export * from './client.types'
export * from './product.types'
export * from './server.types'

// ============================================================================
// Auth & User Types
// ============================================================================

export interface UserSettings {
  username: string
  expertmode: boolean
  recentactivityexpiry: number
}

export interface UserConfiguration {
  user: string
  configuration: {
    read_only: boolean
    server_write_access: boolean
    depot_access: boolean
    host_group_access: boolean
    product_group_access: boolean
    client_creation: boolean
    health: {
      counts: { ok?: number; warning?: number; error?: number }
      worst_case: 'ok' | 'warning' | 'error'
    }
  }
}

export interface AuthSession {
  authenticated: boolean
  username: string
}

// ============================================================================
// App State Types
// ============================================================================

export interface AppState {
  type: 'normal' | 'maintenance'
  address_exceptions?: string[]
  retry_after?: number
}

// ============================================================================
// Depot Types
// ============================================================================

export interface Depot {
  depotId: string
  ident: string
  type: 'OpsiConfigserver' | 'OpsiDepotserver'
  ip: string
  description: string
  selected?: boolean
  depotRemoteUrl?: string
  depotWebdavUrl?: string
  repositoryRemoteUrl?: string
  workbenchRemoteUrl?: string
  depotLocalUrl?: string
  repositoryLocalUrl?: string
  workbenchLocalUrl?: string
  networkAddress?: string
  maxBandwidth?: number
  isMasterDepot?: boolean
  masterDepotId?: string
}

// ============================================================================
// Host & Group Types
// ============================================================================

export interface Host {
  hostId: string
  opsiHostKey?: string
  type?: string
  inventoryNumber?: string
  systemUUID?: string
  description?: string
  notes?: string
  hardwareAddress?: string
  ipAddress?: string
  uefi?: boolean
  created?: string
  lastSeen?: string
}

export interface HostGroup {
  groupId: string
  parentGroupId?: string
  description?: string
  notes?: string
}

export interface GroupTreeNode {
  id: string
  type: 'HostGroup' | 'ProductGroup' | 'ObjectToGroup'
  text: string
  parent: string | null
  children?: Record<string, GroupTreeNode> | null
  hasAnySelection?: boolean
}

export interface HostGroupsResponse {
  groups?: Record<string, GroupTreeNode>
  clientdirectory?: Record<string, GroupTreeNode>
  members?: Array<{ groupId: string; objectId: string }>
}

export interface ProductGroupsResponse {
  groups?: Record<string, GroupTreeNode>
  members?: Array<{ groupId: string; objectId: string }>
}

// ============================================================================
// Config Types
// ============================================================================

export type ConfigType = 'BoolConfig' | 'UnicodeConfig'

export interface ConfigEntry {
  configId: string
  description: string
  type: ConfigType
  value?: string | boolean | string[]
  defaultValues?: unknown[]
  possibleValues?: (string | boolean)[]
  multiValue: boolean
  editable: boolean
  objects?: Record<string, unknown>
  newValue?: string
  newValues?: unknown[]
}

export interface ConfigData {
  general?: ConfigEntry[]
  clientconfig?: ConfigEntry[]
  configed?: ConfigEntry[]
  'opsi-script'?: ConfigEntry[]
  opsiclientd?: ConfigEntry[]
  'software-on-demand'?: ConfigEntry[]
  user?: ConfigEntry[]
  [key: string]: ConfigEntry[] | undefined
}

export interface ConfigComplete {
  configId: string
  editable?: boolean
  multiValue?: boolean
  description?: string
  possibleValues?: string[]
  defaultValues?: string[]
  type?: ConfigType
}

export interface ConfigStates {
  objectIds: string[]
  configs: Array<{ configId: string; value: string | boolean | string[] }>
}

// ============================================================================
// Product Action Types
// ============================================================================

export interface ProductAction {
  action: string
  outdated: boolean
  demoMode: boolean
  installation_status?: string
  action_result?: string
  selectedClients?: string[]
}

export interface PocItem {
  clientIds: string[]
  productIds: string[]
  actionRequest?: string
  actionProgress?: string
  actionResult?: string
  installationStatus?: string
}

export interface ProcessActionRPC {
  client_ids: string[]
  product_ids?: string[]
  visibility?: '' | 'visible' | 'hidden'
}

export interface OpsiclientdRPC {
  client_ids: string[]
  method: string
  params?: unknown[]
}

export interface OpsiclientdRpcResult {
  [clientId: string]: {
    error?: string | null
    result?: string | null
  }
}

// ============================================================================
// Client Clone & Deploy Types
// ============================================================================

export interface CloneTarget {
  hostId: string
  ipAddress?: string
  hardwareAddress?: string
  systemUUID?: string
}

export interface CloneOptions {
  configs: boolean
  products: boolean
  productProperties: boolean
}

export interface ClientDeployData {
  clients: string[]
  username: string
  password: string
  type: 'windows' | 'linux' | 'macos'
}

// ============================================================================
// Health & Diagnostic Types
// ============================================================================

export interface HealthCheck {
  check_id: string
  check_name: string
  check_status: 'ok' | 'warning' | 'error'
  check_description: string
  message: string
  upgrade_issue: string | null
  partial_results: Array<{ message: string; check_status: string }>
}

export interface DiagnosticData {
  [key: string]: unknown
}

// ============================================================================
// Log Types
// ============================================================================

export type LogType = 'instlog' | 'clientconnect' | 'userlogin' | 'bootimage' | 'opsiconfd'

export interface ClientLogResponse {
  result: string[]
}

// ============================================================================
// Backup Types
// ============================================================================

export interface BackupCreateOptions {
  config_files?: boolean
  redis_data?: boolean
  maintenance_mode?: boolean
  password?: string
}

export interface BackupRestoreOptions {
  file_id: string
  config_files?: boolean
  redis_data?: boolean
  server_id?: string
  password?: string
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
  data: T | null
  error: Error | null
  headers: Headers | null
}

export interface ResultWrapper<T> {
  result: T
}
