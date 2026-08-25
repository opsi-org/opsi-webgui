/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

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
