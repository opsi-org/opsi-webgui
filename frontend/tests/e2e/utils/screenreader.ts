/**
 * This file is part of opsi-webgui.
 * Copyright (c) uib GmbH <info@uib.de>
 * License: AGPL-3.0
 *
 * Screen-reader automation.
 */

import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const INTERACTIVE_ROLES = [
  'button',
  'link',
  'checkbox',
  'radio',
  'switch',
  'textbox',
  'searchbox',
  'combobox',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'tab',
  'slider',
  'spinbutton',
]

export interface ScreenReaderOptions {
  reportDir?: string
  name?: string
  bareAppName?: string
}

function findUnnamedInteractive(aria: string): string[] {
  const findings: string[] = []
  const roleAlt = INTERACTIVE_ROLES.join('|')
  // Matches `- <role>` optionally followed by [state] flags, with NO quoted name.
  const unnamed = new RegExp(`^\\s*-\\s+(${roleAlt})(\\s+\\[[^\\]]*\\])*\\s*:?\\s*$`)
  const disabled = /\[disabled\]/
  for (const line of aria.split('\n')) {
    const m = line.match(unnamed)
    if (m && !disabled.test(line)) {
      findings.push(m[1] as string)
    }
  }
  return findings
}

export async function auditScreenReader(page: Page, options?: ScreenReaderOptions): Promise<void> {
  const findings: string[] = []

  const title = (await page.title()).trim()
  const bareAppName = options?.bareAppName ?? 'opsi'
  if (!title) {
    findings.push('document has no <title> — screen reader announces an empty page name')
  } else if (title.toLowerCase() === bareAppName.toLowerCase()) {
    findings.push(`document title is just "${title}" — not specific to the current view`)
  }

  const aria = await page.locator('body').ariaSnapshot()

  const unnamed = findUnnamedInteractive(aria)
  if (unnamed.length) {
    const counts = unnamed.reduce<Record<string, number>>((acc, r) => {
      acc[r] = (acc[r] || 0) + 1
      return acc
    }, {})
    const summary = Object.entries(counts)
      .map(([role, n]) => `${n}× ${role}`)
      .join(', ')
    findings.push(`interactive nodes with no accessible name in the ARIA tree: ${summary}`)
  }

  if (!/^\s*-\s+main\b/m.test(aria)) {
    findings.push('no "main" landmark in the ARIA tree — no skip-to-content target')
  }

  try {
    const reportDir = options?.reportDir ?? 'tests/e2e/reports/screenreader'
    const name = options?.name ?? 'page'
    const file = `${reportDir}/${name}.aria.yml`
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, aria, 'utf-8')
  } catch {
    // Artifact capture is best-effort; never fail the audit on a write error.
  }

  if (findings.length) {
    expect(findings.length, `Screen-reader audit findings:\n  - ${findings.join('\n  - ')}`).toBe(0)
  }
}
