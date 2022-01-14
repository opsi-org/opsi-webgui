import { IObjectString2String } from 'uib-components/.utils/types/tgeneral'

export function mapValues2Value (values: Array<string>, objects: Array<string>, objectsorigin?: Array<string>, defaultvalue?: string) {
  let defvalue = 'none'
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
      return (values[0] === defvalue) ? defvalue : 'mixed'
    }
    if (objectsorigin.length === objects.length) {
      if (values.every(val => val === values[0])) {
        return values[0]
      }
    }
  }
  if (values.every(val => val === defvalue)) {
    return defvalue
  }

  return 'mixed'
}
export function mapValues2Objects (values: Array<string>, objects: Array<string>, objectsorigin: Array<string>, defaultValue: string) {
  // if (!values && !values[0]) {
  //   return {}
  // }
  if (objects === undefined || objects === null) {
    return {}
  }
  const client2value: IObjectString2String = {}
  for (const o in objectsorigin) {
    const i = objects.indexOf(objectsorigin[o])
    if (i >= 0 && values) {
      client2value[objects[i]] = values[i]
    } else if (i >= 0) {
      client2value[objects[i]] = defaultValue
    } else {
      client2value[objectsorigin[o]] = defaultValue
    }
  }
  return client2value
}