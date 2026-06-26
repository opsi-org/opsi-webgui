import { describe, it, expect } from 'vitest'
import { needsMoreToFill } from '~/app/utils/datatable'

describe('needsMoreToFill', () => {
  it('loads more when content does not fill the container and more data exists', () => {
    // 4K case:
    expect(
      needsMoreToFill({ scrollHeight: 900, clientHeight: 1900, hasMore: true, loading: false })
    ).toBe(true)
  })

  it('does not load more once the content overflows the container', () => {
    // FullHD case:
    expect(
      needsMoreToFill({ scrollHeight: 2400, clientHeight: 900, hasMore: true, loading: false })
    ).toBe(false)
  })

  it('never loads more when there is no more data', () => {
    expect(
      needsMoreToFill({ scrollHeight: 200, clientHeight: 1900, hasMore: false, loading: false })
    ).toBe(false)
  })

  it('does not stack requests while a fetch is in flight', () => {
    expect(
      needsMoreToFill({ scrollHeight: 200, clientHeight: 1900, hasMore: true, loading: true })
    ).toBe(false)
  })

  it('treats a perfectly filled container (within 1px) as full', () => {
    expect(
      needsMoreToFill({ scrollHeight: 901, clientHeight: 900, hasMore: true, loading: false })
    ).toBe(true)
    expect(
      needsMoreToFill({ scrollHeight: 902, clientHeight: 900, hasMore: true, loading: false })
    ).toBe(false)
  })
})
