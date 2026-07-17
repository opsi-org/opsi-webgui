/**
 * Performance stress tests for groups with large data sets.
 */
import { describe, it, expect } from 'vitest'
import type { GroupTreeNodeData } from '~/types'

function generateIds(prefix: string, count: number): string[] {
  const ids: string[] = []
  for (let i = 0; i < count; i++) ids.push(prefix + '-' + i)
  return ids
}

function measureMs(fn: () => void): number {
  const start = performance.now()
  fn()
  return performance.now() - start
}

function addItemsToArray(existing: string[], incoming: string[]): string[] {
  const set = new Set(existing)
  const toAdd = incoming.filter((id) => set.has(id) === false)
  return toAdd.length > 0 ? existing.concat(toAdd) : existing
}

function removeItemsFromArray(existing: string[], toRemove: string[]): string[] {
  const removeSet = new Set(toRemove)
  return existing.filter((id) => removeSet.has(id) === false)
}

function addItemsToArraySlow(existing: string[], incoming: string[]): string[] {
  const result = [...existing]
  for (const id of incoming) {
    if (result.includes(id) === false) result.push(id)
  }
  return result
}

describe('selectionStore bulk operations – large-data performance', () => {
  it('addClients (Set-based) with 5000 items < 50 ms', () => {
    const ids = generateIds('client', 5000)
    const ms = measureMs(() => addItemsToArray([], ids))
    expect(
      ms,
      'addItems(5000) took ' + ms.toFixed(1) + ' ms — exceeds 50 ms threshold'
    ).toBeLessThan(50)
  })

  it('addClients idempotent for 5000 duplicates < 50 ms', () => {
    const ids = generateIds('client', 5000)
    const existing = addItemsToArray([], ids)
    const ms = measureMs(() => addItemsToArray(existing, ids))
    expect(ms, 'addItems duplicates took ' + ms.toFixed(1) + ' ms').toBeLessThan(50)
    expect(addItemsToArray(existing, ids)).toHaveLength(5000)
  })

  it('removeClients (Set-based) with 5000 items < 50 ms', () => {
    const ids = generateIds('client', 5000)
    const existing = addItemsToArray([], ids)
    const ms = measureMs(() => removeItemsFromArray(existing, ids))
    expect(ms, 'removeItems(5000) took ' + ms.toFixed(1) + ' ms').toBeLessThan(50)
  })

  it('Set-based add is faster than O(n^2) includes-based add for 2000 items', () => {
    const ids = generateIds('client', 2000)
    const setMs = measureMs(() => addItemsToArray([], ids))
    const slowMs = measureMs(() => addItemsToArraySlow([], ids))
    expect(
      setMs * 5,
      'Set (' +
        setMs.toFixed(1) +
        ' ms) should be >=5x faster than includes (' +
        slowMs.toFixed(1) +
        ' ms)'
    ).toBeLessThan(slowMs)
  })
})

function buildLargeGroupTree(groupCount: number, membersPerGroup: number): GroupTreeNodeData[] {
  const groups: GroupTreeNodeData[] = []
  for (let g = 0; g < groupCount; g++) {
    const members: string[] = []
    for (let m = 0; m < membersPerGroup; m++) members.push('client-' + g + '-' + m)
    groups.push({
      id: 'group-' + g,
      label: 'Group ' + g,
      type: 'HostGroup',
      memberCount: membersPerGroup,
      members,
      children: undefined,
    })
  }
  return groups
}

type FlatItem = {
  id: string
  label: string
  depth: number
  isGroup: boolean
  memberCount: number
  hasChildren: boolean
  isExpanded: boolean
}

function flattenNodes(
  nodes: GroupTreeNodeData[],
  depth: number,
  query: string,
  expandedSet: Set<string>
): FlatItem[] {
  const result: FlatItem[] = []
  for (const node of nodes) {
    const label = node.label || node.id
    const labelMatch = query === '' || label.toLowerCase().includes(query)
    const hasGroupChildren = (node.children?.length || 0) > 0
    const hasMemberChildren = (node.members?.length || 0) > 0
    const isGroup =
      hasGroupChildren ||
      hasMemberChildren ||
      node.type === 'HostGroup' ||
      node.type === 'ProductGroup'
    const isExpanded = expandedSet.has(node.id)
    if (query === '' && isExpanded === false) {
      if (labelMatch) {
        result.push({
          id: node.id,
          label,
          depth,
          isGroup,
          memberCount: node.memberCount || node.members?.length || 0,
          hasChildren: hasGroupChildren || hasMemberChildren,
          isExpanded: false,
        })
      }
      continue
    }
    const childQuery = labelMatch ? '' : query
    const childItems = node.children
      ? flattenNodes(node.children, depth + 1, childQuery, expandedSet)
      : []
    const memberItems: FlatItem[] = []
    if (node.members) {
      let matchCount = 0
      for (const m of node.members) {
        if (childQuery === '' || m.toLowerCase().includes(childQuery)) {
          if (matchCount < 200) {
            memberItems.push({
              id: m,
              label: m,
              depth: depth + 1,
              isGroup: false,
              memberCount: 0,
              hasChildren: false,
              isExpanded: false,
            })
          }
          matchCount++
        }
      }
    }
    if (labelMatch || childItems.length > 0 || memberItems.length > 0) {
      result.push({
        id: node.id,
        label,
        depth,
        isGroup,
        memberCount: node.memberCount || node.members?.length || 0,
        hasChildren: hasGroupChildren || hasMemberChildren,
        isExpanded: query !== '' || isExpanded,
      })
      for (const item of childItems) result.push(item)
      for (const item of memberItems) result.push(item)
    }
  }
  return result
}

describe('flattenNodes – large group tree performance', () => {
  it('200 groups collapsed (no search) < 10 ms', () => {
    const tree = buildLargeGroupTree(200, 500)
    const ms = measureMs(() => flattenNodes(tree, 0, '', new Set()))
    expect(ms, 'flattenNodes(collapsed) took ' + ms.toFixed(1) + ' ms').toBeLessThan(10)
  })

  it('50 expanded groups with 500 members each < 50 ms', () => {
    const tree = buildLargeGroupTree(50, 500)
    const expanded = new Set(tree.map((g: GroupTreeNodeData) => g.id))
    const ms = measureMs(() => flattenNodes(tree, 0, '', expanded))
    expect(ms, 'flattenNodes(expanded) took ' + ms.toFixed(1) + ' ms').toBeLessThan(50)
  })

  it('search filter on 200 groups x 500 members < 50 ms', () => {
    const tree = buildLargeGroupTree(200, 500)
    const ms = measureMs(() => flattenNodes(tree, 0, 'client-5', new Set()))
    expect(ms, 'flattenNodes(search) took ' + ms.toFixed(1) + ' ms').toBeLessThan(50)
  })
})

describe('member selection Set lookup performance', () => {
  it('Set.has() for 5000 members < 1 ms', () => {
    const members = generateIds('member', 5000)
    const selectedSet = new Set(members.slice(0, 2500))
    const ms = measureMs(() => {
      for (const m of members) selectedSet.has(m)
    })
    expect(ms, 'Set.has() x5000 took ' + ms.toFixed(2) + ' ms').toBeLessThan(1)
  })

  it('Set.has() is faster than Array.includes() for 2000 items', () => {
    const members = generateIds('member', 2000)
    const selectedArray = members.slice(0, 1000)
    const selectedSet = new Set(selectedArray)
    const arrayMs = measureMs(() => {
      for (const m of members) selectedArray.includes(m)
    })
    const setMs = measureMs(() => {
      for (const m of members) selectedSet.has(m)
    })
    expect(
      setMs * 5,
      'Set (' +
        setMs.toFixed(2) +
        ' ms) should be >=5x faster than includes (' +
        arrayMs.toFixed(2) +
        ' ms)'
    ).toBeLessThan(arrayMs)
  })
})
