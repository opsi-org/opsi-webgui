import { describe, it, expect } from 'vitest'
import { needsMoreToFill, isAutoPageStalled, hasMoreInfiniteData, reloadWindowPerPage, shouldPrefetchNextPage } from '~/app/utils/datatable'

describe('needsMoreToFill', () => {
  it('loads more when content does not fill the container and more data exists', () => {
    // 4K case:
    expect(needsMoreToFill({ scrollHeight: 900, clientHeight: 1900, hasMore: true, loading: false })).toBe(true)
  })

  it('does not load more once the content overflows the container', () => {
    // FullHD case:
    expect(needsMoreToFill({ scrollHeight: 2400, clientHeight: 900, hasMore: true, loading: false })).toBe(false)
  })

  it('never loads more when there is no more data', () => {
    expect(needsMoreToFill({ scrollHeight: 200, clientHeight: 1900, hasMore: false, loading: false })).toBe(false)
  })

  it('does not stack requests while a fetch is in flight', () => {
    expect(needsMoreToFill({ scrollHeight: 200, clientHeight: 1900, hasMore: true, loading: true })).toBe(false)
  })

  it('treats a perfectly filled container (within 1px) as full', () => {
    expect(needsMoreToFill({ scrollHeight: 901, clientHeight: 900, hasMore: true, loading: false })).toBe(true)
    expect(needsMoreToFill({ scrollHeight: 902, clientHeight: 900, hasMore: true, loading: false })).toBe(false)
  })
})

describe('isAutoPageStalled', () => {
  it('stalls when a next-page request adds no rows (data/total mismatch)', () => {
    // Regression: restricted depot access users got total=4 but 1 row,
    // causing endless empty page requests on the servers page.
    expect(isAutoPageStalled(1, 1)).toBe(true)
  })

  it('stalls when rows shrink after a next-page request', () => {
    expect(isAutoPageStalled(1, 0)).toBe(true)
  })

  it('does not stall when the page added rows', () => {
    expect(isAutoPageStalled(50, 100)).toBe(false)
  })

  it('does not stall when no auto page request was in flight', () => {
    expect(isAutoPageStalled(-1, 0)).toBe(false)
    expect(isAutoPageStalled(-1, 100)).toBe(false)
  })
})

describe('hasMoreInfiniteData', () => {
  it('reports more data while rows are below the server total', () => {
    expect(hasMoreInfiniteData(false, 50, 100)).toBe(true)
  })

  it('reports no more data once all rows are loaded', () => {
    expect(hasMoreInfiniteData(false, 100, 100)).toBe(false)
    expect(hasMoreInfiniteData(false, 101, 100)).toBe(false)
  })

  it('hides the loading indicator when auto-paging stalled despite a larger server total', () => {
    // Regression: restricted depot access users saw a permanently spinning
    // loading row because total > reachable rows kept hasMoreData true.
    expect(hasMoreInfiniteData(true, 1, 4)).toBe(false)
  })
})

describe('reloadWindowPerPage', () => {
  it('covers every loaded row so a reload does not drop earlier pages', () => {
    // Regression: saving action requests after scrolling to product 120
    // reloaded page 6 only and replaced all rows with that single page.
    expect(reloadWindowPerPage(20, 120)).toBe(120)
  })

  it('rounds up to full pages', () => {
    expect(reloadWindowPerPage(20, 105)).toBe(120)
  })

  it('keeps at least one page for an empty table', () => {
    expect(reloadWindowPerPage(20, 0)).toBe(20)
  })

  it('returns the page size unchanged for invalid page sizes', () => {
    expect(reloadWindowPerPage(0, 120)).toBe(0)
  })
})

describe('shouldPrefetchNextPage', () => {
  it('requests the next page before the end of the list is reached', () => {
    expect(shouldPrefetchNextPage({ scrollTop: 1400, scrollHeight: 3000, clientHeight: 1000 })).toBe(true)
  })

  it('does not request while the user is far from the end', () => {
    expect(shouldPrefetchNextPage({ scrollTop: 0, scrollHeight: 3000, clientHeight: 1000 })).toBe(false)
  })

  it('uses a minimum trigger distance on small viewports', () => {
    expect(shouldPrefetchNextPage({ scrollTop: 500, scrollHeight: 1000, clientHeight: 200 })).toBe(true)
    expect(shouldPrefetchNextPage({ scrollTop: 400, scrollHeight: 1000, clientHeight: 200 })).toBe(false)
  })
})
