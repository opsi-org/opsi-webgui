import { describe, it, expect, afterEach } from 'vitest'
import { VALID_PAGES, getDefaultPageFromCookie } from '~/app/utils/navigation'

describe('navigation', () => {
  afterEach(() => {
    delete (globalThis as { document?: unknown }).document
  })

  it('VALID_PAGES contains the core routes', () => {
    expect(VALID_PAGES).toContain('/clients')
    expect(VALID_PAGES).toContain('/dashboard')
    expect(VALID_PAGES).toContain('/admin/diagnostics')
  })

  it('returns the fallback when document is unavailable', () => {
    expect(getDefaultPageFromCookie()).toBe('/clients')
    expect(getDefaultPageFromCookie('/dashboard')).toBe('/dashboard')
  })

  it('returns the stored page when the cookie holds a valid page', () => {
    ;(globalThis as { document?: { cookie: string } }).document = {
      cookie: 'foo=bar; opsi-webgui-default-page=%2Fproducts; baz=qux',
    }
    expect(getDefaultPageFromCookie()).toBe('/products')
  })

  it('falls back when the cookie holds an unknown page', () => {
    ;(globalThis as { document?: { cookie: string } }).document = {
      cookie: 'opsi-webgui-default-page=%2Fnot-a-real-page',
    }
    expect(getDefaultPageFromCookie('/dashboard')).toBe('/dashboard')
  })
})
