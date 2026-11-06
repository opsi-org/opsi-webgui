/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import type { ProductActionRequestChange, ProductRow } from '~/types'

export interface ActionRequestChangeSummary {
  changed: number
  unsupported: number
}

export function applyBulkActionRequest(
  products: Pick<ProductRow, 'productId' | 'actionRequest' | 'actions'>[],
  selectedProductIds: string[],
  actionRequest: string,
  pending: Map<string, ProductActionRequestChange>,
): ActionRequestChangeSummary {
  const summary = { changed: 0, unsupported: 0, unchanged: 0, unavailable: 0 }
  const productsById = new Map(products.map((product) => [product.productId, product]))
  for (const productId of new Set(selectedProductIds)) {
    const product = productsById.get(productId)
    if (!product) {
      continue
    }
    if (actionRequest !== 'none' && !product.actions?.includes(actionRequest)) {
      summary.unsupported++
      continue
    }
    const oldRequest = product.actionRequest || 'none'
    const currentRequest = pending.get(productId)?.actionRequest ?? oldRequest
    if (currentRequest !== actionRequest) summary.changed++
    if (actionRequest === oldRequest) pending.delete(productId)
    else pending.set(productId, { productId, actionRequest, oldRequest })
  }
  return summary
}

export type ActionRequestStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral'

export function getActionRequestStatus(value?: unknown): ActionRequestStatus {
  switch (String(value ?? 'none').toLowerCase()) {
    case 'setup':
      return 'warning'
    case 'uninstall':
      return 'error'
    case 'update':
    case 'once':
      return 'info'
    case 'always':
      return 'success'
    default:
      return 'neutral'
  }
}

export function getActionRequestColorClass(value?: unknown): string {
  switch (getActionRequestStatus(value)) {
    case 'warning':
      return 'bg-(--color-warning-soft-bg)! border-(--color-warning-soft-text)/40! text-(--color-warning-soft-text)!'
    case 'error':
      return 'bg-(--color-error-soft-bg)! border-(--color-error-soft-text)/40! text-(--color-error-soft-text)!'
    case 'info':
      return 'bg-(--color-info-soft-bg)! border-(--color-info-soft-text)/40! text-(--color-info-soft-text)!'
    case 'success':
      return 'bg-(--color-success-soft-bg)! border-(--color-success-soft-text)/40! text-(--color-success-soft-text)!'
    default:
      return ''
  }
}
