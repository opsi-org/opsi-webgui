import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Pinia / Vue reactivity
vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  return {
    ...actual,
    computed: (fn: () => unknown) => ({ value: fn() }),
  }
})

const mockUserStore = {
  readOnly: false,
  clientCreation: true,
  serverWriteAccess: true,
  depotAccessRestricted: false,
  hostGroupAccessRestricted: false,
  productGroupAccessRestricted: false,
  disabledFeatures: [] as string[],
}

vi.mock('~/stores/userStore', () => ({
  useUserStore: () => mockUserStore,
}))

describe('useUserPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.readOnly = false
    mockUserStore.clientCreation = true
    mockUserStore.serverWriteAccess = true
    mockUserStore.depotAccessRestricted = false
    mockUserStore.hostGroupAccessRestricted = false
    mockUserStore.productGroupAccessRestricted = false
    mockUserStore.disabledFeatures = []
  })

  async function getPermissions() {
    const mod = await import('~/app/composables/useUserPermissions')
    return mod.useUserPermissions()
  }

  describe('isFeatureDisabled', () => {
    it('returns false when feature is not disabled', async () => {
      mockUserStore.disabledFeatures = []
      const { isFeatureDisabled } = await getPermissions()
      expect(isFeatureDisabled('terminal')).toBe(false)
    })

    it('returns true when feature is disabled', async () => {
      mockUserStore.disabledFeatures = ['terminal']
      const { isFeatureDisabled } = await getPermissions()
      expect(isFeatureDisabled('terminal')).toBe(true)
    })
  })

  describe('isFeatureEnabled', () => {
    it('returns true when feature is not in disabled list', async () => {
      mockUserStore.disabledFeatures = []
      const { isFeatureEnabled } = await getPermissions()
      expect(isFeatureEnabled('terminal')).toBe(true)
    })

    it('returns false when feature is in disabled list', async () => {
      mockUserStore.disabledFeatures = ['terminal']
      const { isFeatureEnabled } = await getPermissions()
      expect(isFeatureEnabled('terminal')).toBe(false)
    })
  })

  describe('isPageAccessible', () => {
    it('returns true for unrestricted pages', async () => {
      const { isPageAccessible } = await getPermissions()
      expect(isPageAccessible('/clients')).toBe(true)
      expect(isPageAccessible('/products')).toBe(true)
      expect(isPageAccessible('/servers')).toBe(true)
      expect(isPageAccessible('/dashboard')).toBe(true)
    })

    it('returns false for terminal when readOnly', async () => {
      mockUserStore.readOnly = true
      const { isPageAccessible } = await getPermissions()
      expect(isPageAccessible('/admin/terminal')).toBe(false)
    })

    it('returns false for terminal when terminal feature disabled', async () => {
      mockUserStore.disabledFeatures = ['terminal']
      const { isPageAccessible } = await getPermissions()
      expect(isPageAccessible('/admin/terminal')).toBe(false)
    })

    it('returns false for terminal when messagebus_terminal disabled', async () => {
      mockUserStore.disabledFeatures = ['messagebus_terminal']
      const { isPageAccessible } = await getPermissions()
      expect(isPageAccessible('/admin/terminal')).toBe(false)
    })

    it('returns true for terminal when all conditions met', async () => {
      mockUserStore.readOnly = false
      mockUserStore.disabledFeatures = []
      const { isPageAccessible } = await getPermissions()
      expect(isPageAccessible('/admin/terminal')).toBe(true)
    })

    it('returns false for client creation when readOnly', async () => {
      mockUserStore.readOnly = true
      const { isPageAccessible } = await getPermissions()
      expect(isPageAccessible('/clients/add')).toBe(false)
    })

    it('returns false for client creation when clientCreation disabled', async () => {
      mockUserStore.clientCreation = false
      const { isPageAccessible } = await getPermissions()
      expect(isPageAccessible('/clients/add')).toBe(false)
    })

    it('returns false for client clone when not permitted', async () => {
      mockUserStore.clientCreation = false
      const { isPageAccessible } = await getPermissions()
      expect(isPageAccessible('/clients/clone')).toBe(false)
    })

    it('returns false for maintenance when readOnly', async () => {
      mockUserStore.readOnly = true
      const { isPageAccessible } = await getPermissions()
      expect(isPageAccessible('/admin/maintenance')).toBe(false)
    })
  })

  describe('filterNavItems', () => {
    it('filters out inaccessible nav items', async () => {
      mockUserStore.readOnly = true
      mockUserStore.disabledFeatures = ['terminal', 'messagebus_terminal']

      const { filterNavItems } = await getPermissions()
      const items = [
        { route: '/clients' },
        { route: '/admin/terminal' },
        { route: '/admin/maintenance' },
        { route: '/products' },
      ]
      const filtered = filterNavItems(items)

      expect(filtered.some((i) => i.route === '/clients')).toBe(true)
      expect(filtered.some((i) => i.route === '/products')).toBe(true)
      expect(filtered.some((i) => i.route === '/admin/terminal')).toBe(false)
      expect(filtered.some((i) => i.route === '/admin/maintenance')).toBe(false)
    })

    it('filters submenu items', async () => {
      mockUserStore.readOnly = true
      const { filterNavItems } = await getPermissions()

      const items = [
        {
          route: '/admin',
          submenu: [
            { route: '/admin/diagnostics' },
            { route: '/admin/terminal' },
            { route: '/admin/maintenance' },
          ],
        },
      ]
      const filtered = filterNavItems(items)

      if (filtered.length > 0) {
        const adminItem = filtered[0]
        expect(adminItem.submenu?.some((s) => s.route === '/admin/diagnostics')).toBe(true)
        expect(adminItem.submenu?.some((s) => s.route === '/admin/terminal')).toBe(false)
        expect(adminItem.submenu?.some((s) => s.route === '/admin/maintenance')).toBe(false)
      }
    })

    it('removes parent if all submenu items filtered out', async () => {
      mockUserStore.readOnly = true
      mockUserStore.disabledFeatures = ['terminal', 'messagebus_terminal']
      const { filterNavItems } = await getPermissions()

      const items = [
        {
          route: '/admin',
          submenu: [{ route: '/admin/terminal' }, { route: '/admin/maintenance' }],
        },
      ]
      const filtered = filterNavItems(items)
      expect(filtered).toHaveLength(0)
    })
  })

  describe('computed permissions', () => {
    it('canCreateClients reflects userStore.clientCreation', async () => {
      mockUserStore.clientCreation = true
      const { canCreateClients } = await getPermissions()
      expect(canCreateClients.value).toBe(true)

      mockUserStore.clientCreation = false
      const { canCreateClients: cc2 } = await getPermissions()
      expect(cc2.value).toBe(false)
    })

    it('isReadOnly reflects userStore.readOnly', async () => {
      mockUserStore.readOnly = false
      const { isReadOnly } = await getPermissions()
      expect(isReadOnly.value).toBe(false)

      mockUserStore.readOnly = true
      const { isReadOnly: ro2 } = await getPermissions()
      expect(ro2.value).toBe(true)
    })

    it('isTerminalEnabled checks both features', async () => {
      mockUserStore.disabledFeatures = []
      const { isTerminalEnabled } = await getPermissions()
      expect(isTerminalEnabled.value).toBe(true)

      mockUserStore.disabledFeatures = ['terminal']
      const { isTerminalEnabled: te2 } = await getPermissions()
      expect(te2.value).toBe(false)
    })
  })
})
