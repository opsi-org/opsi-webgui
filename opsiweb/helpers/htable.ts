import { IObjectString2String } from '~/types/tsettings'

export function mapValues2Value (values:Array<string>, objects:Array<string>, objectsorigin:Array<string>|undefined) {
  if (!values || !values[0]) {
    return 'none'
  }
  if (objects === undefined || objects === null) {
    return 'none'
  }
  if (objects.length === 0) {
    return 'none'
  }
  if (objectsorigin) {
    if (objectsorigin.length === 1 && values.length === 1) {
      return values[0]
    }
    if (objectsorigin.length > 1 && values.length === 1) {
      return (values[0] === 'none') ? 'none' : 'mixed'
    }
    if (objectsorigin.length === objects.length) {
      if (values.every(val => val === values[0])) {
        return values[0]
      }
    }
  }
  if (values.every(val => val === 'none')) {
    return 'none'
  }

  return 'mixed'
}
export function mapValues2Objects (values:Array<string>, objects:Array<string>) {
  if (!values || !values[0]) {
    return
  }
  if (objects === undefined) {
    return
  }
  const client2value: IObjectString2String = {}
  for (const i in objects) {
    client2value[objects[i]] = values[i]
  }
  return client2value
}
