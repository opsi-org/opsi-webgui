/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export const useUtils = () => {
  function delay(ms: number) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
  }

  const addOrRemoveListItem = (arr: any[], upload: any, by = 'ident') => {
    const index = arr.findIndex(function (element) {
      return element[by] === upload[by]
    })
    if (index > -1) {
      arr.splice(index, 1)
    } else {
      arr.push(upload)
    }
    return arr
  }
  const isEqual = (arr: any[]) => {
    if (arr.length === 0) return true
    return arr.every((v) => v === arr[0])
  }

  const equals = (a: any, b: any) => {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.length !== b.length) return false

    // if is array
    if (Array.isArray(a) && Array.isArray(b)) {
      for (let i = 0; i < a.length; ++i) {
        if (!equals(a[i], b[i])) return false
      }
      return true
    }

    // if is object
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      if (keysA.length !== keysB.length) return false
      for (const key of keysA) {
        if (!equals(a[key], b[key])) return false
      }
      return true
    }

    return false
  }

  return { addOrRemoveListItem, isEqual, delay, equals }
}
