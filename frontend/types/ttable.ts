/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import type { IObjectString2ObjectString2String } from './tgeneral'

export interface ITableRowItemProducts {
  ident: Array<string>
  productId: string
  selectedDepots: Array<string>
  selectedClients: Array<string>
  request: Array<string>
  actions: Array<string>
  actionRequestDetails?: Array<string>
  depotVersions: Array<string>
  clientVersions: Array<string>
  client_version_outdated: boolean
  depot_version_diff: boolean
  installationStatus: Array<string>
  actionResult: Array<string>
  actionRequest: string
  actionRequestNew?: string
  _rowVariant?: string
  tooltiptext?: IObjectString2ObjectString2String
}

export interface IProductDependency {
  productId: string
  productAction: string | null
  version: string
  requiredProductId: string
  requiredVersion: string | null
  requiredAction: string | null
  requiredInstallationStatus: string | null
  requirementType: string | null
}
