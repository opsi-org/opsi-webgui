/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
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
  productType: ProductType
  depotId: string
  ident: string
  selected: boolean
  name: string
  description: string
  advice: string
  modificationTime: string
  installationStatusErrorLevel: number
  installationStatus: string
  actionRequest: string
  actionProgress: string
  actionResultErrorLevel: number
  actionResult: string
  clientVersionOutdated: boolean
  depotVersionDiff: boolean
  notOnAllDepots: boolean
  numDepots: number
  actions: string[]
  selectedDepots: string[]
  selectedClients: string[]
  clientVersions?: string[]
  depotVersions?: string[]
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
