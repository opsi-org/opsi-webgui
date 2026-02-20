import { describe, it, expect, vi } from 'vitest'
import { useSessionTimer } from '~/app/composables/useTimer'

vi.mock('~/composables/mixins/useComponent', () => ({
  useNotification: () => ({ notifyInfo: vi.fn() }),
}))
vi.mock('~/composables/mixins/useGet', () => ({
  useConfigserver: vi.fn(),
}))
vi.mock('~/composables/mixins/usePost', () => ({
  useCallLogout: vi.fn(() => ({ callLogout: vi.fn() })),
}))
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))
globalThis.storeAuth = () => ({
  isAuthenticated: true,
  sessionEndTime: new Date(Date.now() + 60000).toISOString(),
  setSession: vi.fn(),
  setExpiresIn: vi.fn(),
  sessionExpiresIn: { diff: 60000, days: 0, hours: 0, minutes: 1, seconds: 0 },
  logout: vi.fn(),
  clearSession: vi.fn(),
})
globalThis.storeSettings = () => ({
  setExpiresInterval: vi.fn(),
})

describe('useSessionTimer', () => {
  it('should initialize and provide countdownText', () => {
    const timer = useSessionTimer(false)
    expect(timer.countdownText.value).toBe('')
    expect(typeof timer.startCountdown).toBe('function')
    expect(typeof timer.formatCountdownText).toBe('function')
  })

  it('should format countdown text correctly', () => {
    const timer = useSessionTimer(false)
    const text = timer.formatCountdownText({ days: 0, hours: 1, minutes: 2, seconds: 3 })
    expect(text).toContain('1h 2m 3s')
  })
})
