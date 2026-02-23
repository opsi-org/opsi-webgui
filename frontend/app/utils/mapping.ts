/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import type { StringStringMap } from '../types/shared/general.types'

interface NamesMap {
  none?: string
  mixed?: string
}

export function mapValuesToValue(
  values: string[],
  objects: string[],
  objectsOrigin?: string[],
  defaultValue?: string,
  names: NamesMap = {}
): string {
  const defValue = defaultValue ?? names.none ?? 'none'
  if (!values?.[0] || !objects?.length) return defValue

  if (objectsOrigin) {
    if (objectsOrigin.length === 1 && values.length === 1) return values[0]
    if (objectsOrigin.length > 1 && values.length === 1) {
      if (objects.length !== objectsOrigin.length) {
        return values[0] === defValue ? defValue : (names.mixed ?? 'mixed')
      }
      return values[0]
    }
    if (objectsOrigin.length === objects.length && values.every((val) => val === values[0])) {
      return values[0]
    }
  }
  if (values.every((val) => val === defValue)) return defValue
  return names.mixed ?? 'mixed'
}

export function mapValuesToObjects(
  values: string[],
  objects: string[],
  objectsOrigin: string[],
  defaultValue: string
): StringStringMap {
  if (!objects) return {}
  const clientToValue: StringStringMap = {}
  for (const originKey of objectsOrigin) {
    const i = objects.indexOf(originKey)
    const objectKey = objects[i]
    if (i >= 0 && values.length === 1) {
      if (values[0] === undefined) throw new Error('values contains undefined value')
      if (objectKey !== undefined) clientToValue[objectKey] = values[0]
    } else if (i >= 0 && values[i] !== undefined) {
      if (objectKey !== undefined) clientToValue[objectKey] = values[i]
    } else if (i >= 0) {
      if (objectKey !== undefined) clientToValue[objectKey] = defaultValue
    } else {
      clientToValue[originKey] = defaultValue
    }
  }
  return clientToValue
}
