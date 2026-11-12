/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, isReadonly } from 'vue'
import { extractRecursiveMembersFromDynamicResponse } from '../../../app/utils/groupMembers'

vi.mock('~/stores/userStore', () => ({ useUserStore: () => ({}) }))

describe('recursive group-member caches', () => {
  const api = {
    getHostGroups: vi.fn(),
    getProductGroups: vi.fn(),
    getHostGroupMembersRecursive: vi.fn(),
    getProductGroupMembersRecursive: vi.fn(),
  }

  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
    vi.stubGlobal('useApiHelpers', () => api)
    api.getHostGroups.mockResolvedValue({ data: {} })
    api.getProductGroups.mockResolvedValue({ data: { groups: {} } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reactively exposes recursive clients without changing direct members', async () => {
    const { useCachedData } = await import('../../../app/composables/useCachedData')
    const cache = useCachedData()
    api.getHostGroups.mockResolvedValue({
      data: { id: 'parent', type: 'HostGroup', children: { direct: { id: 'direct', type: 'ObjectToGroup' } } },
    })
    await cache.fetchClientGroups(true)
    const before = JSON.stringify(cache.clientGroupsTree.value)
    const members = computed(() => cache.getCachedGroupMembersRecursive('parent', ['depot-b', 'depot-a']))
    expect(members.value).toBeUndefined()

    api.getHostGroupMembersRecursive.mockResolvedValue({ data: { members: ['direct', 'nested'] } })
    await cache.fetchGroupMembersRecursive('parent', ['depot-a', 'depot-b'])

    expect(members.value).toEqual(['direct', 'nested'])
    expect(isReadonly(members.value)).toBe(true)
    expect(JSON.stringify(cache.clientGroupsTree.value)).toBe(before)
    await cache.fetchGroupMembersRecursive('parent', ['depot-b', 'depot-a'])
    expect(api.getHostGroupMembersRecursive).toHaveBeenCalledTimes(1)
  })

  it('distinguishes empty from unknown and separates depot scopes', async () => {
    const { useCachedData } = await import('../../../app/composables/useCachedData')
    const cache = useCachedData()
    api.getHostGroupMembersRecursive.mockResolvedValueOnce({ data: { members: [] } })
    await cache.fetchGroupMembersRecursive('parent', ['depot-a'])
    expect(cache.getCachedGroupMembersRecursive('parent', ['depot-a'])).toEqual([])
    expect(cache.getCachedGroupMembersRecursive('parent', ['depot-b'])).toBeUndefined()

    api.getHostGroupMembersRecursive.mockResolvedValueOnce({ data: { members: ['other-client'] } })
    await cache.fetchGroupMembersRecursive('parent', ['depot-b'])
    expect(cache.getCachedGroupMembersRecursive('parent', ['depot-b'])).toEqual(['other-client'])
    expect(cache.getCachedGroupMembersRecursive('parent', ['depot-a'])).toEqual([])
    expect(api.getHostGroupMembersRecursive).toHaveBeenLastCalledWith({
      parentGroup: 'parent',
      selectedDepots: '[depot-b]',
    })
  })

  it('invalidates reactive client snapshots on full refresh', async () => {
    const { useCachedData } = await import('../../../app/composables/useCachedData')
    const cache = useCachedData()
    const members = computed(() => cache.getCachedGroupMembersRecursive('parent', ['depot']))
    api.getHostGroupMembersRecursive.mockResolvedValue({ data: { members: ['old-client'] } })
    await cache.fetchGroupMembersRecursive('parent', ['depot'])
    expect(members.value).toEqual(['old-client'])

    await cache.fetchClientGroups(true, ['depot'])
    expect(members.value).toBeUndefined()
    api.getHostGroupMembersRecursive.mockResolvedValue({ data: { members: ['new-client'] } })
    await cache.fetchGroupMembersRecursive('parent', ['depot'])
    expect(members.value).toEqual(['new-client'])
  })

  it('reactively exposes and invalidates product snapshots, including empty groups', async () => {
    const { useCachedData } = await import('../../../app/composables/useCachedData')
    const cache = useCachedData()
    const members = computed(() => cache.getCachedProductGroupMembersRecursive('parent'))
    expect(members.value).toBeUndefined()
    api.getProductGroupMembersRecursive.mockResolvedValue({ data: { members: ['product'] } })
    await cache.fetchProductGroupMembersRecursive('parent')
    expect(members.value).toEqual(['product'])
    expect(isReadonly(members.value)).toBe(true)
    await cache.fetchProductGroupMembersRecursive('parent')
    expect(api.getProductGroupMembersRecursive).toHaveBeenCalledTimes(1)

    await cache.fetchProductGroups(true, true)
    expect(members.value).toBeUndefined()
    api.getProductGroupMembersRecursive.mockResolvedValue({ data: { members: [] } })
    await cache.fetchProductGroupMembersRecursive('parent')
    expect(members.value).toEqual([])
  })
})

describe('extractRecursiveMembersFromDynamicResponse', () => {
  it('returns normalized values from members array', () => {
    const members = extractRecursiveMembersFromDynamicResponse({
      members: ['client-1.example.test', 'client-2.example.test;group-a', 'not_assigned'],
      groups: {},
    })
    expect(members).toEqual(['client-1.example.test', 'client-2.example.test'])
  })

  it('falls back to ObjectToGroup children when members is missing', () => {
    const members = extractRecursiveMembersFromDynamicResponse({
      groups: {
        children: {
          a: {
            id: 'client-a.example.test;not_assigned',
            text: 'client-a.example.test',
            type: 'ObjectToGroup',
          },
          b: {
            id: 'client-b.example.test;not_assigned',
            text: 'client-b.example.test',
            type: 'ObjectToGroup',
          },
          c: {
            id: 'not_assigned',
            text: 'not_assigned',
            type: 'HostGroup',
          },
        },
      },
    })

    expect(members).toEqual(['client-a.example.test', 'client-b.example.test'])
  })

  it('deduplicates overlapping members from both payload locations', () => {
    const members = extractRecursiveMembersFromDynamicResponse({
      members: ['client-a.example.test', 'client-b.example.test'],
      groups: {
        children: {
          a: {
            id: 'client-a.example.test;some-group',
            text: 'client-a.example.test',
            type: 'ObjectToGroup',
          },
        },
      },
    })

    expect(members).toEqual(['client-a.example.test', 'client-b.example.test'])
  })
})
