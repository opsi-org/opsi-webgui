/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export function objectEqual(aOrig: any, bOrig: any): boolean {
  if (aOrig === bOrig) {
    return true
  }

  const obj1 = Object.hasOwn(aOrig, 'value') ? aOrig.value : aOrig
  const obj2 = Object.hasOwn(bOrig, 'value') ? bOrig.value : bOrig

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    console.warn('objectEqual: keys1.length !== keys2.length', keys1, keys2)
    return false
  }
  for (const key of keys1) {
    if (!Object.hasOwn(obj2, key) || obj1[key] !== obj2[key]) {
      console.warn('objectEqual: ', key, 'obj1[key] !== obj2[key]', obj1[key], obj2[key])
      return false
    }
  }
  return true
  // return keys1.every(key =>
  //     bOrig.hasOwnProperty(key) && aOrig[key] == bOrig[key]);
}
export function arrayEqual(aOrig: Array<any>, bOrig: Array<any>): boolean {
  if (bOrig == undefined && aOrig == undefined) return true
  if (bOrig == undefined || aOrig == undefined) return false

  if (aOrig.length === bOrig.length && aOrig.length === 0) {
    return true
  } else if (aOrig.length !== bOrig.length) {
    return false
  }
  const a = JSON.parse(JSON.stringify(aOrig))
  const b = JSON.parse(JSON.stringify(bOrig))
  if (a === b) {
    return true
  }
  if (a == null || b == null) {
    return false
  }
  if (a.length !== b.length) {
    return false
  }

  if (isArray(a) && isArray(b)) {
    a.sort()
    b.sort()
  } else if (isArray(a) || isArray(b)) {
    throw new Error('arrayEqual: isArray(a) || isArray(b)' + a + b)
  }

  for (let i = 0; i < a.length; ++i) {
    // !!!! error: Empty block statement (no-empty) !!!!
    // if (a[i] == b[i]) {
    // } else return false;
    if (a[i] != b[i]) {
      return false
    }
  }
  return true
}
export function isObject(obj: any) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
export function isArray(obj: any) {
  return Array.isArray(obj)
}
export default {
  arrayEqual,
  objectEqual,
}
