/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import type { IObjectString2String, IObjectString2StringOrUndefined } from '../types/tgeneral'

export function mapValues2Value(
  values: Array<string>,
  objects: Array<string>,
  objectsorigin?: Array<string>,
  defaultvalue?: string,
  names: any = undefined
) {
  let defvalue = names.none || 'none'
  if (defaultvalue) {
    defvalue = defaultvalue
  }
  if (!values || !values[0]) {
    return defvalue
  }
  if (objects === undefined || objects === null) {
    return defvalue
  }
  if (objects.length === 0) {
    return defvalue
  }
  if (objectsorigin) {
    if (objectsorigin.length === 1 && values.length === 1) {
      return values[0]
    }
    if (objectsorigin.length > 1 && values.length === 1) {
      if (objects.length !== objectsorigin.length) {
        return values[0] === defvalue ? defvalue : names.mixed || 'mixed'
      }
      return values[0]
    }
    if (objectsorigin.length === objects.length) {
      if (values.every((val) => val === values[0])) {
        return values[0]
      }
    }
  }
  if (values.every((val) => val === defvalue)) {
    return defvalue
  }

  return names.mixed || 'mixed'
}

export function mapValues2Objects(
  values: string[],
  objects: string[],
  objectsorigin: string[],
  defaultValue: string
) {
  if (objects === undefined || objects === null) {
    return {}
  }
  const client2value: IObjectString2String = {}
  for (const o in objectsorigin) {
    if (o === undefined || objectsorigin[o] === undefined) {
      throw new Error('objectsorigin contains undefined value')
    }
    const i = objects.indexOf(objectsorigin[o])

    if (i === undefined || objects[i] === undefined) {
      throw new Error('objects contains undefined value')
    }
    if (i >= 0 && values.length === 1) {
      if (values[0] === undefined) {
        throw new Error('values contains undefined value')
      }
      client2value[objects[i]] = values[0] // @ts-ignore
    } else if (i >= 0 && values) {
      if (values[i] === undefined) {
        throw new Error('values contains undefined value')
      }
      client2value[objects[i]] = values[i]
    } else if (i >= 0) {
      client2value[objects[i]] = defaultValue
    } else {
      client2value[objectsorigin[o]] = defaultValue
    }
  }
  return client2value
}

export default {
  mapValues2Value,
  mapValues2Objects,
}
