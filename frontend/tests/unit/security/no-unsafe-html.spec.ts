import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Security regression guard against XSS via `v-html`.
 */

const APP_DIR = fileURLToPath(new URL('../../../app', import.meta.url))

// Files that intentionally use v-html with trusted, sanitised content.
// Add an entry here (with justification).
const ALLOWLIST = new Set<string>([])

function collectVueFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...collectVueFiles(full))
    } else if (entry.endsWith('.vue')) {
      out.push(full)
    }
  }
  return out
}

describe('no unsafe v-html (XSS guard)', () => {
  it('does not introduce v-html sinks in components', () => {
    const offenders: string[] = []
    for (const file of collectVueFiles(APP_DIR)) {
      const rel = relative(APP_DIR, file)
      if (ALLOWLIST.has(rel)) continue
      const content = readFileSync(file, 'utf-8')
      if (/\bv-html\b/.test(content)) {
        offenders.push(rel)
      }
    }
    expect(
      offenders,
      `v-html found in: ${offenders.join(', ')}. Render text with {{ }} to keep auto-escaping, or add an audited entry to ALLOWLIST.`
    ).toEqual([])
  })
})
