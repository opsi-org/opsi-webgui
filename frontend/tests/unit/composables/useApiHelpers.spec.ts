import { describe, expect, it } from 'vitest'
import { buildQueryString } from '~/app/composables/useApiHelpers'

describe('buildQueryString', () => {
  it('omits null and undefined optional parameters', () => {
    expect(buildQueryString({ filterQuery: undefined, hardwareClass: null, page: 1, perPage: 100 })).toBe('?page=1&perPage=100')
  })

  it('returns no question mark when no parameters remain', () => {
    expect(buildQueryString()).toBe('')
    expect(buildQueryString({ filterQuery: undefined })).toBe('')
  })

  it('preserves false, zero, empty strings, and serialized arrays', () => {
    expect(buildQueryString({ includeAbsent: false, page: 0, filterQuery: '', hardwareClass: ['DISK'] })).toBe(
      '?includeAbsent=false&page=0&filterQuery=&hardwareClass=%5B%22DISK%22%5D',
    )
  })
})
