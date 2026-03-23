export interface Server {
  depotId: string
  ident?: string
  type?: string
  ip?: string
  description?: string
  depotRemoteUrl?: string
  depotWebdavUrl?: string
  repositoryRemoteUrl?: string
  workbenchRemoteUrl?: string
  selected?: boolean | number
}

export interface ServerAttr {
  hostId: string
  type: 'OpsiConfigserver' | 'OpsiDepotserver'
  description: string
  notes: string
  hardwareAddress?: string
  ipAddress: string
  inventoryNumber?: string
  systemUUID?: string
  opsiHostKey?: string
  depotLocalUrl?: string
  depotRemoteUrl?: string
  depotWebdavUrl?: string
  repositoryLocalUrl?: string
  repositoryRemoteUrl?: string
  workbenchLocalUrl?: string
  workbenchRemoteUrl?: string
  networkAddress?: string
  maxBandwidth?: number
  isMasterDepot?: boolean
  masterDepotId?: string
}

export interface Client {
  clientId: string
  ident?: string
  description?: string
  notes?: string
  macAddress?: string
  hardwareAddress?: string
  ipAddress?: string
  inventoryNumber?: string
  systemUUID?: string
  lastSeen?: string
  depotId?: string
  uefi?: boolean
  uefi_value?: boolean | null
  version_outdated?: number
  version_outdated_netboot?: number
  installationStatus_unknown?: number
  installationStatus_installed?: number
  actionResult_failed?: number
  actionResult_successful?: number
  selected?: boolean | number
  reachable?: boolean | null
}

export interface ClientAttr {
  hostId: string
  type: string
  description: string
  notes: string
  hardwareAddress?: string
  ipAddress?: string
  inventoryNumber: string
  systemUUID?: string
  created: string
  lastSeen: string
  opsiHostKey: string
  oneTimePassword?: string
  uefi: boolean
}

export type ProductType = 'LocalbootProduct' | 'NetbootProduct'

export interface ProductRow {
  productId: string
  productType?: ProductType
  depotId?: string
  ident?: string
  selected?: boolean | number
  locked?: boolean
  name?: string
  description?: string
  advice?: string
  modificationTime?: string | null
  priority?: number
  installationStatus?: string
  installationStatusDetails?: string[]
  actionRequest?: string
  actionRequestDetails?: string[]
  actionProgress?: string
  actionResult?: string
  actionResultDetails?: string[]
  client_version_outdated?: boolean
  depot_version_diff?: boolean
  not_on_all_depots?: boolean
  numDepots?: number
  actions?: string[]
  selectedServers?: string[]
  selectedClients?: string[] | null
  clientVersions?: string[] | null
  depotVersions?: string[]
  [key: string]: unknown
}

export interface ProductProperty {
  productId: string
  propertyId: string
  type: 'UnicodeProductProperty' | 'BoolProductProperty'
  version: string
  description: string
  multiValue: boolean
  editable: boolean
  default: (string | boolean)[]
  possibleValues: Record<string, (string | boolean)[]>
  allValues: (string | boolean)[]
  depots: Record<string, (string | boolean)[]>
  clients: Record<string, (string | boolean)[]>
  defaultDetails?: Record<string, (string | boolean)[]>
  versionDetails?: Record<string, string>
  descriptionDetails?: Record<string, string>
  multiValueDetails?: Record<string, boolean>
  editableDetails?: Record<string, boolean>
  allClientValuesEqual: boolean
  anyDepotDifferentFromDefault: boolean
  anyClientDifferentFromDepot: boolean
  _showDetails?: boolean
  newValue?: string
  newValues?: string[]
}

export interface ProductDependency {
  productId: string
  productAction: string | null
  version: string
  requiredProductId: string
  requiredVersion: string | null
  requiredAction: string | null
  requiredInstallationStatus: string | null
  requirementType: string | null
}

export interface ProductActionRequestChange {
  productId: string
  actionRequest: string
  oldRequest: string
}

export type EditablePropertyValue = string | boolean | string[]

export interface EditableProductProperty extends ProductProperty {
  _value: EditablePropertyValue
  _originalValue: EditablePropertyValue
}

export type ProductVisibility = '' | 'hidden' | 'visible'

export interface ProductConfigTabsRef {
  hasAnyChanges: boolean
  isSaving: boolean
  changedCount: number
  changedProperties: Map<string, EditablePropertyValue>
  changedActionRequests: Map<string, ProductActionRequestChange>
  saveAll: () => Promise<void>
  discardAll: () => void
  discardSingleProperty: (propertyId: string) => void
  discardSingleActionRequest: (productId: string) => void
  getOriginalPropertyValue: (propertyId: string) => EditablePropertyValue | undefined
  fmtVal: (v: unknown) => string
  refresh: () => Promise<void>
}

export interface GroupTreeNodeData {
  id: string
  label: string
  parentId?: string | null
  description?: string
  notes?: string
  type?: 'HostGroup' | 'ProductGroup' | 'ObjectToGroup'
  children?: GroupTreeNodeData[]
  memberCount?: number
  members?: string[]
  isRoot?: boolean
  isSpecial?: boolean
  hasSelection?: boolean
}

export interface GroupTreeNode {
  id: string
  name: string
  description: string
  notes?: string
  count: number
  members: string[]
  parentGroupId?: string | null
  children: GroupTreeNode[]
  level: number
  isSpecial?: boolean
}

export type GroupAction =
  | 'addSubgroup'
  | 'edit'
  | 'delete'
  | 'manageMembers'
  | 'removeAllMembers'
  | 'copy'

export interface GroupFormData {
  groupId: string
  description: string
  notes: string
  parentGroupId: string
}

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

export interface HealthCheck {
  check_id: string
  check_name: string
  check_status: 'ok' | 'warning' | 'error'
  check_description: string
  message: string
  upgrade_issue: string | null
  partial_results: Array<{ message: string; check_status: string }>
}

export type LogType = 'instlog' | 'clientconnect' | 'userlogin' | 'bootimage' | 'opsiconfd'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  visible?: boolean
  alwaysVisible?: boolean
  class?: string
  headerClass?: string
  width?: string
  minWidth?: string
  align?: 'left' | 'center' | 'right'
  icon?: string
}

export type NestedStringMap = Record<string, Record<string, string>>
