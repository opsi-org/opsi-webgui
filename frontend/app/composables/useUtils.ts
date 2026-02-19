/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

// Assertion
export function assertOrThrow(condition: any, message: string = 'Type error') {
  if (!condition) {
    console.error(message)
    throw new Error(message)
  }
}

// Array Utilities
export function useArrayHelpers() {
  // Add item if not present, remove if present (by key).
  function toggleItem<T>(arr: T[], item: T, key: string = 'ident'): T[] {
    const idx = arr.findIndex((el: any) => el[key] === (item as any)[key])
    if (idx > -1) arr.splice(idx, 1)
    else arr.push(item)
    return arr
  }

  // Check if all values in array are equal.
  function allValuesEqual<T>(arr: T[]): boolean {
    return arr.length === 0 || arr.every((v) => v === arr[0])
  }

  // Deep equality check for arrays/objects.
  function deepEqual(a: any, b: any): boolean {
    if (a === b) return true
    if (a == null || b == null) return false
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; ++i) if (!deepEqual(a[i], b[i])) return false
      return true
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      if (keysA.length !== keysB.length) return false
      for (const key of keysA) if (!deepEqual(a[key], b[key])) return false
      return true
    }
    return false
  }

  return { toggleItem, allValuesEqual, deepEqual }
}

// Blocking Timer
export function useBlockingDelay() {
  // Synchronous/blocking delay (not recommended for UI).
  function sleep(ms: number) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
  }
  return { sleep }
}

// String Constants & Helpers
export function useStringConstants() {
  const constants = {
    content: '(content)',
    bracketContent: '[content]',
    countAll: 'count/all',
    colon: ':',
    empty: '--',
    titleDelimiter: ' - ',
    project: 'opsi-webgui',
    projectWebgui: ' WebGUI',
    uib: 'uib GmbH',
    unequal: '≠',
    notOrigin: '*',
  }
  function getConstant(key: keyof typeof constants) {
    return constants[key]
  }
  return { constants, getConstant }
}

// Date Formatting
export function useDateFormatter() {
  function formatDate(value: string): string {
    if (!value || typeof value === 'object') return ''
    let date, time
    if (value.includes('T') && value.includes('Z')) {
      date = new Date(value.split('T')[0])
      time = value.split('T')[1].split('Z')[0]
    } else if (value.includes('T')) {
      date = new Date(value.split('T')[0])
      time = value.split('T')[1]
    } else if (value.includes(' ')) {
      date = new Date(value.split(' ')[0])
      time = value.split(' ')[1]
    } else {
      console.warn('formatDate: unknown format', value)
      return ''
    }
    if (!date || !time) return ''
    const d = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      ...time.split(':').map(Number)
    )
    const pad = (n: number) => ('0' + n).slice(-2)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }
  return { formatDate }
}
