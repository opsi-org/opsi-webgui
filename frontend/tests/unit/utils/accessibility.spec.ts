import { describe, it, expect } from 'vitest'
import { withAccessibleName } from '~/app/utils/accessibility'

describe('withAccessibleName', () => {
  it('leaves attrs untouched when an accessible name already exists', () => {
    for (const key of ['aria-label', 'aria-labelledby', 'id', 'title']) {
      const attrs = { [key]: 'x', placeholder: 'Search' }
      expect(withAccessibleName(attrs)).toBe(attrs)
    }
  })

  it('derives aria-label from a non-empty placeholder', () => {
    const result = withAccessibleName({ placeholder: 'Search clients' })
    expect(result['aria-label']).toBe('Search clients')
  })

  it('ignores a blank placeholder', () => {
    const result = withAccessibleName({ placeholder: '   ' })
    expect(result['aria-label']).toBeUndefined()
  })

  it('returns attrs unchanged when there is nothing to derive from', () => {
    const attrs = { type: 'text' }
    expect(withAccessibleName(attrs)).toBe(attrs)
  })
})
