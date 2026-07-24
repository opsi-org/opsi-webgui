import { describe, expect, it } from 'vitest'
import { extractRecursiveMembersFromDynamicResponse } from '../../../app/utils/groupMembers'

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
