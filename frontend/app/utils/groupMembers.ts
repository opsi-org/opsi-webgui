/*
 * Group-member normalization helpers for dynamic group API responses.
 */

function normalizeMemberId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  const id = trimmed.split(';')[0] || trimmed
  if (!id || id.toLowerCase() === 'not_assigned') return null
  return id
}

export function extractRecursiveMembersFromDynamicResponse(payload: { members?: unknown; groups?: Record<string, unknown> }): string[] {
  const collected: string[] = []

  if (Array.isArray(payload.members)) {
    for (const member of payload.members) {
      const normalized = normalizeMemberId(member)
      if (normalized) collected.push(normalized)
    }
  }

  const children = (payload.groups?.children || {}) as Record<string, unknown>
  for (const child of Object.values(children)) {
    const childObj = child as Record<string, unknown>
    if ((childObj.type as string) !== 'ObjectToGroup') continue
    const memberId = normalizeMemberId((childObj.id as string) || (childObj.text as string))
    if (memberId) collected.push(memberId)
  }

  return [...new Set(collected)]
}
