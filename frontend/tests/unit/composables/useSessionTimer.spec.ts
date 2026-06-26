import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  return {
    ...actual,
    watch: vi.fn(),
    onMounted: vi.fn((cb) => cb()),
    onUnmounted: vi.fn(),
  }
})

vi.mock('#imports', () => ({
  useI18n: () => ({ t: (key: string) => key }),
  navigateTo: vi.fn(),
}))

const mockUserStore = {
  sessionEndTime: new Date(Date.now() + 60000).toISOString(),
  isAuthenticated: true,
  logout: vi.fn(),
  setSession: vi.fn(),
}

vi.mock('~/stores/userStore', () => ({
  useUserStore: () => mockUserStore,
}))

describe('useSessionTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.sessionEndTime = new Date(Date.now() + 60000).toISOString()
    mockUserStore.isAuthenticated = true
  })

  it('should export the composable', async () => {
    const { useSessionTimer } = await import('~/app/composables/useSessionTimer')
    expect(useSessionTimer).toBeDefined()
    expect(typeof useSessionTimer).toBe('function')
  })

  it('should provide timer state', async () => {
    const { useSessionTimer } = await import('~/app/composables/useSessionTimer')
    const timer = useSessionTimer(false)

    expect(timer.remainingSeconds).toBeDefined()
    expect(timer.isWarning).toBeDefined()
    expect(timer.isExpired).toBeDefined()
    expect(timer.formattedTime).toBeDefined()
    expect(timer.formattedTimeText).toBeDefined()
  })

  it('should format time correctly', async () => {
    const { useSessionTimer } = await import('~/app/composables/useSessionTimer')
    const timer = useSessionTimer(false)

    expect(timer.formatTime(0)).toBe('0:00')
    expect(timer.formatTime(65)).toBe('1:05')
    expect(timer.formatTime(3661)).toBe('61:01')
  })

  it('should provide start and stop functions', async () => {
    const { useSessionTimer } = await import('~/app/composables/useSessionTimer')
    const timer = useSessionTimer(false)

    expect(typeof timer.startTimer).toBe('function')
    expect(typeof timer.stopTimer).toBe('function')
    expect(typeof timer.refreshSession).toBe('function')
  })

  it('formatTimeText formats expired, seconds, minutes and hours', async () => {
    const { useSessionTimer } = await import('~/app/composables/useSessionTimer')
    const timer = useSessionTimer(false)

    expect(timer.formatTimeText(0)).toBe('auth.expired')
    expect(timer.formatTimeText(45)).toBe('45s')
    expect(timer.formatTimeText(125)).toBe('2m 5s')
    expect(timer.formatTimeText(3700)).toBe('1h 1m')
  })

  it('startTimer derives remaining + warning state and stopTimer clears it', async () => {
    mockUserStore.sessionEndTime = new Date(Date.now() + 120 * 1000).toISOString()
    const { useSessionTimer } = await import('~/app/composables/useSessionTimer')
    const timer = useSessionTimer(false)

    timer.startTimer()
    expect(timer.remainingSeconds.value).toBeGreaterThan(100)
    expect(timer.isWarning.value).toBe(true)
    expect(timer.isExpired.value).toBe(false)
    expect(timer.isRunning.value).toBe(true)

    timer.stopTimer()
    expect(timer.isRunning.value).toBe(false)
  })

  it('marks the session expired when the end time is already in the past', async () => {
    mockUserStore.sessionEndTime = new Date(Date.now() - 1000).toISOString()
    const { useSessionTimer } = await import('~/app/composables/useSessionTimer')
    const timer = useSessionTimer(false)

    timer.startTimer()
    expect(timer.remainingSeconds.value).toBe(0)
    expect(timer.isExpired.value).toBe(true)
    timer.stopTimer()
  })

  it('refreshSession delegates renewal to the user store', async () => {
    const { useSessionTimer } = await import('~/app/composables/useSessionTimer')
    const timer = useSessionTimer(false)

    timer.refreshSession(900)
    expect(mockUserStore.setSession).toHaveBeenCalledWith(900)
  })
})
