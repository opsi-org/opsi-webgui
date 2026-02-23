/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

export interface HostParameter {
  [key: string]: HostParameterEntry[]
}

export type ConfigType = 'BoolConfig' | 'UnicodeConfig' | 'Config'

export interface HostParameterEntry {
  configId: string
  description: string
  type: ConfigType
  value: string | boolean | string[]
  possibleValues: Array<string | boolean>
  multiValue: boolean
  editable: boolean
  newValue?: string
  newValues?: string[]
  [key: string]: string | boolean | string[] | boolean[] | Array<string | boolean> | undefined
}
