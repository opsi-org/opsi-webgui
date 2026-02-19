import { describe, it, expect } from 'vitest'
import { isObjectEqual } from '~/app/utils/compare'

describe('isObjectEqual', () => {
  it('returns true for identical objects', () => {
    expect(isObjectEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
  })

  it('returns false for objects with different keys', () => {
    expect(isObjectEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  })

  it('returns false for objects with different values', () => {
    expect(isObjectEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false)
  })

  it('handles objects with a "value" property', () => {
    expect(isObjectEqual({ value: { x: 1 } }, { value: { x: 1 } })).toBe(true)
    expect(isObjectEqual({ value: { x: 1 } }, { value: { x: 2 } })).toBe(false)
  })

  it('returns true for the same object reference', () => {
    const obj = { a: 1 }
    expect(isObjectEqual(obj, obj)).toBe(true)
  })
})
