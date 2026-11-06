import { describe, expect, it } from 'vitest'
import { buttonAppearance } from '../../../app/utils/buttonAppearance'

describe('button appearance', () => {
  it('distinguishes commands, confirmations, dismissals and destructive commands', () => {
    expect(buttonAppearance('command')).toEqual({ color: 'primary', variant: 'outline' })
    expect(buttonAppearance('confirm')).toEqual({ color: 'primary', variant: 'solid' })
    expect(buttonAppearance('dismiss')).toEqual({ color: 'neutral', variant: 'ghost' })
    expect(buttonAppearance('inline')).toEqual({ color: 'neutral', variant: 'ghost' })
    expect(buttonAppearance('destructive')).toEqual({ color: 'error', variant: 'ghost' })
  })

  it('keeps active toggles soft, not filled like confirmations or tabs', () => {
    expect(buttonAppearance('toggle', true)).toEqual({ color: 'primary', variant: 'soft' })
    expect(buttonAppearance('toggle', false)).toEqual({ color: 'neutral', variant: 'ghost' })
  })
})
