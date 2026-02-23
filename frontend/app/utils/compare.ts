/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

export function isObject(obj: unknown): obj is Record<string, unknown> {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

export function isArray(obj: unknown): obj is unknown[] {
  return Array.isArray(obj)
}

export function isObjectEqual<T extends object>(a: T, b: T): boolean {
  if (a === b) return true

  type ValueObj = { value?: unknown }
  const obj1 = Object.hasOwn(a, 'value') ? (a as ValueObj).value : a
  const obj2 = Object.hasOwn(b, 'value') ? (b as ValueObj).value : b
  const keys1 = Object.keys(obj1 as object)
  const keys2 = Object.keys(obj2 as object)
  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (
      !Object.hasOwn(obj2 as object, key) ||
      !(obj1 as Record<string, unknown>)[key] === undefined ||
      (obj1 as Record<string, unknown>)[key] !== (obj2 as Record<string, unknown>)[key]
    ) {
      return false
    }
  }
  return true
}

export function isArrayEqual<T>(a: T[] | undefined, b: T[] | undefined): boolean {
  if (a === undefined && b === undefined) return true
  if (a === undefined || b === undefined) return false
  if (a.length !== b.length) return false
  if (a.length === 0) return true

  const aSorted = [...a].sort()
  const bSorted = [...b].sort()
  for (let i = 0; i < aSorted.length; ++i) {
    if (aSorted[i] !== bSorted[i]) return false
  }
  return true
}
