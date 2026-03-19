/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
*/

import type { NestedStringMap } from '../shared/general.types'

export type ProductType = 'LocalbootProduct' | 'NetbootProduct'

export interface Product {
  locked: boolean
  productId: string
  productVersion: string
  packageVersion: string
  productType: ProductType
  depotId: string
  type: 'ProductOnDepot'
  ident: string
}

export type ProductIds = string[]

export interface ProductRow {
  productId: string
  productType?: ProductType
  depotId?: string
  ident?: string
  selected?: boolean | number
  name?: string
  description?: string
  advice?: string
  modificationTime?: string | null
  priority?: number
  installationStatusErrorLevel?: number
  installationStatus?: string
  installationStatusDetails?: string[]
  actionRequest?: string
  actionProgress?: string
  actionResultErrorLevel?: number
  actionResult?: string
  actionResultDetails?: string[]
  // API returns snake_case for these fields
  client_version_outdated?: boolean
  depot_version_diff?: boolean
  not_on_all_depots?: boolean
  numDepots?: number
  actions?: string[]
  selectedDepots?: string[]
  selectedClients?: string[] | null
  clientVersions?: string[] | null
  depotVersions?: string[]
  [key: string]: unknown
}

/* Tracks product action requests/changes per client */
export interface ProductChangeMap {
  [clientId: string]: {
    [productId: string]: {
      actionRequest: string
      old: string
    }
  }
}

/* Flat structure for product changes, used for UI and batch actions. */
export interface ProductChangeFlat {
  clientIds: string[]
  productIds: string[]
  actionRequest: string
  old?: string
}

export interface ProductTableRow {
  ident: string[]
  productId: string
  selectedDepots: string[]
  selectedClients: string[]
  request: string[]
  actions: string[]
  actionRequestDetails?: string[]
  depotVersions: string[]
  clientVersions: string[]
  clientVersionOutdated: boolean
  depotVersionDiff: boolean
  installationStatus: string[]
  actionResult: string[]
  actionRequest: string
  actionRequestNew?: string
  rowVariant?: string
  tooltipText?: NestedStringMap
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

/* Error messages for product dependencies and properties */
export interface ProductDependencyError {
  dependencies: string
  properties: string
}

export type ProductPropertyType = 'UnicodeProductProperty' | 'BoolProductProperty'
export type ProductPropertyValue = string | boolean

export interface ProductProperty {
  productId: string
  propertyId: string
  type: ProductPropertyType
  version: string
  description: string
  multiValue: boolean
  editable: boolean
  default: ProductPropertyValue[]
  possibleValues: Record<string, ProductPropertyValue[]>
  allValues: ProductPropertyValue[]
  depots: Record<string, ProductPropertyValue[]>
  clients: Record<string, ProductPropertyValue[]>
  defaultDetails?: Record<string, ProductPropertyValue[]>
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

// Product properties and dependencies result types
export interface ProductProperties {
  [key: string]: ProductProperty
}

export interface ProductPropertiesResult extends ProductPropDepResult {
  properties: ProductProperties
}

// Shared base for product dependencies/properties
export interface ProductPropDepResult {
  productVersions: Record<string, string | undefined>
  productDescription: string
  productDescriptionDetails: Record<string, string>
  productAdvice: string
  productAdviceDetails: Record<string, string>
}

export interface ProductDependencies {
  productId: string
  productAction: string | null
  version: string
  requiredProductId: string
  requiredVersion: string | null
  requiredAction: string | null
  requiredInstallationStatus: string | null
  requirementType: string | null
}

export interface ProductDependenciesResult extends ProductPropDepResult {
  dependencies: ProductDependencies[]
}

export interface ProductPropertiesDependenciesResult {
  dependencies: ProductDependenciesResult
  properties: ProductPropertiesResult
}

export type EditablePropertyValue = string | boolean | string[]

export interface EditableProductProperty extends ProductProperty {
  _value: EditablePropertyValue
  _originalValue: EditablePropertyValue
}

export interface ProductActionRequestChange {
  productId: string
  actionRequest: string
  oldRequest: string
}

export interface ProcessActionPayload {
  client_ids: string[]
  product_ids?: string[]
  visibility?: '' | 'visible' | 'hidden'
}

export type ProductVisibility = '' | 'visible' | 'hidden'

export interface ProductQuickActionFilters {
  installationStatus: string
  actionResult: string
  outdatedOnly: boolean
}

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
