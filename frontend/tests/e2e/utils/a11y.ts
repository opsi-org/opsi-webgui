/**
 * Accessibility helper : wraps @axe-core/playwright for WCAG 2.1 AA.
 */

import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

export interface A11yOptions {
  exclude?: string[]
}

/** NuxtUI internal elements that produce false-positive a11y violations */
const NUXTUI_EXCLUSIONS = [
  '[data-grace-area-trigger]', // UTooltip trigger wrappers (informational, not interactive buttons)
  'button[role="checkbox"][data-slot="base"]', // UCheckbox internal button (name from contextual label)
]

/**
 * Runs axe-core WCAG 2.1 AA scan. Fails the test on critical/serious violations.
 */
export async function checkA11y(page: Page, options?: A11yOptions): Promise<void> {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])

  const exclusions = [...NUXTUI_EXCLUSIONS, ...(options?.exclude || [])]
  for (const sel of exclusions) {
    builder = builder.exclude(sel)
  }

  const results = await builder.analyze()

  const critical = results.violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .filter((v) => {
      // Known false-positive with modal overlays in Nuxt UI:
      // root "#__nuxt" may be reported for aria-hidden-focus even though focus is managed in portal content.
      if (v.id !== 'aria-hidden-focus') return true
      return !v.nodes.every((n) => n.target.some((t) => t === '#__nuxt'))
    })

  if (critical.length > 0) {
    const summary = critical
      .map((v) => {
        const nodes = v.nodes
          .slice(0, 8)
          .map((n) => `      • ${n.target.join(' ')}`)
          .join('\n')
        return `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length > 1 ? 's' : ''})\n${nodes}`
      })
      .join('\n')
    expect(critical.length, `Accessibility violations:\n${summary}`).toBe(0)
  }
}
