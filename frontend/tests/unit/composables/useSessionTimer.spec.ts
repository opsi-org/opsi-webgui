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

// Mock useI18n
vi.mock('#imports', () => ({
  useI18n: () => ({ t: (key: string) => key }),
  navigateTo: vi.fn(),
}))

// Mock the user store
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
})
