/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useInventoryFilters - Pure client-side filter/sort/race-guard helpers for the
 * client hardware/software inventory panel.
 */
import type { HardwareInventoryItem, SoftwareInventoryItem } from '~/types'

export function isInventoryPresent(state: number | null | undefined): boolean {
  return state === null || state === undefined || state !== 0
}

export function filterHardwareItems(
  items: HardwareInventoryItem[],
  options: { classFilter?: string; query?: string } = {},
): HardwareInventoryItem[] {
  let result = items
  if (options.classFilter) {
    result = result.filter((item) => item.className === options.classFilter)
  }
  const query = options.query?.trim().toLowerCase()
  if (query) {
    result = result.filter(
      (item) =>
        item.displayName.toLowerCase().includes(query) ||
        item.className.toLowerCase().includes(query) ||
        item.attributes.some((attr) =>
          String(attr.value ?? '')
            .toLowerCase()
            .includes(query),
        ),
    )
  }
  return result
}

export function filterSoftwareItems(
  items: SoftwareInventoryItem[],
  options: { includeKbUpdates?: boolean; query?: string } = {},
): SoftwareInventoryItem[] {
  let result = items
  if (options.includeKbUpdates === false) {
    result = result.filter((item) => !item.isKbUpdate)
  }
  const query = options.query?.trim().toLowerCase()
  if (query) {
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.windowsDisplayName || '').toLowerCase().includes(query) ||
        (item.version || '').toLowerCase().includes(query),
    )
  }
  return result
}

function compareInventoryValues(a: unknown, b: unknown): number {
  if (a === b) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1
  return String(a).localeCompare(String(b))
}

export function sortInventoryItems<T extends Record<string, unknown>>(items: T[], sortBy: string, sortDesc: boolean): T[] {
  const sorted = [...items].sort((a, b) => compareInventoryValues(a[sortBy], b[sortBy]))
  return sortDesc ? sorted.reverse() : sorted
}

/**
 * Guards against a slower/older async fetch overwriting a newer one, e.g. when the
 * user switches clients or tabs while a request is still in flight.
 */
export function createRequestGuard() {
  let current = 0
  return {
    next: (): number => ++current,
    isCurrent: (id: number): boolean => id === current,
  }
}
