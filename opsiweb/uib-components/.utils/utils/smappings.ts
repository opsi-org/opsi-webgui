// import { IObjectString2String } from '../types/tgeneral'
import { IObjectString2String } from '../types/tgeneral'

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
      if (objects.length !== objectsorigin.length) return 'mixed'
      return values[0]
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
  if (objects === undefined || objects === null) {
    return {}
  }
  const client2value: IObjectString2String = {}
  for (const o in objectsorigin) {

    const i = objects.indexOf(objectsorigin[o])
    console.log(o, i, objects[i])
    if (i >= 0 && values.length === 1) {
      console.log('0...', client2value[objects[i]])
      client2value[objects[i]] = values[0]
    } else
    if (i >= 0 && values) {
      client2value[objects[i]] = values[i]
      console.log('1...', client2value[objects[i]])
    } else if (i >= 0) {
      client2value[objects[i]] = defaultValue
      console.log('2...', client2value[objects[i]])
    } else {
      client2value[objectsorigin[o]] = defaultValue
      console.log('3...',  client2value[objects[i]])
    }
  }
  return client2value
}


export default {
  mapValues2Value,
  mapValues2Objects
}
