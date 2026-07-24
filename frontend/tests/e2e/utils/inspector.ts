/**
 * This file is part of opsi-webgui.
 * Copyright (c) uib GmbH <info@uib.de>
 * License: AGPL-3.0
 *
 * Accessibility inspector - manual-style checks that automated axe-core scans typically miss.
 */

import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface InspectorOptions {
  exclude?: string[]
  maxTabStops?: number
  skipKeyboardWalk?: boolean
}

interface InspectorResult {
  unnamed: string[]
  headings: string[]
  landmarks: string[]
  keyboard: string[]
}

export async function inspectA11y(page: Page, options?: InspectorOptions): Promise<void> {
  const exclude = options?.exclude || []

  // 1. Name / Role / Value: every interactive element needs an accessible name.
  const unnamed = await page.evaluate((excludeSel: string[]) => {
    const isExcluded = (el: Element) => excludeSel.some((sel) => el.closest(sel) !== null)

    const accessibleName = (el: Element): string => {
      const aria = el.getAttribute('aria-label')
      if (aria && aria.trim()) return aria.trim()
      const labelledby = el.getAttribute('aria-labelledby')
      if (labelledby) {
        const txt = labelledby
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent || '')
          .join(' ')
          .trim()
        if (txt) return txt
      }
      const title = el.getAttribute('title')
      if (title && title.trim()) return title.trim()
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
        const id = el.getAttribute('id')
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`)
          if (label?.textContent?.trim()) return label.textContent.trim()
        }
        const placeholder = el.getAttribute('placeholder')
        if (placeholder && placeholder.trim()) return placeholder.trim()
      }
      const text = (el as HTMLElement).innerText || el.textContent || ''
      if (text.trim()) return text.trim()
      const img = el.querySelector('img[alt]')
      if (img?.getAttribute('alt')?.trim()) return img.getAttribute('alt')!.trim()
      return ''
    }

    const selector =
      'a[href], button, [role="button"], [role="link"], [role="menuitem"], [role="tab"], [role="checkbox"], [role="switch"], input:not([type="hidden"]), select, textarea'
    const els = Array.from(document.querySelectorAll(selector))
    const findings: string[] = []
    for (const el of els) {
      const htmlEl = el as HTMLElement
      const rect = htmlEl.getBoundingClientRect()
      const visible = rect.width > 0 && rect.height > 0 && htmlEl.offsetParent !== null
      if (!visible) continue
      if (htmlEl.getAttribute('aria-hidden') === 'true') continue
      if (htmlEl.closest('[aria-hidden="true"]')) continue
      if (htmlEl.hasAttribute('disabled')) continue
      if (htmlEl.getAttribute('aria-disabled') === 'true') continue
      if (htmlEl.matches('button[role="checkbox"][data-slot="base"], [data-grace-area-trigger]'))
        continue
      if (isExcluded(htmlEl)) continue
      if (!accessibleName(htmlEl)) {
        const tag = htmlEl.tagName.toLowerCase()
        const role = htmlEl.getAttribute('role') || tag
        const cls = (htmlEl.getAttribute('class') || '').slice(0, 40)
        findings.push(`<${tag} role="${role}" class="${cls}">`)
      }
    }
    return Array.from(new Set(findings)).slice(0, 20)
  }, exclude)

  // 2. Heading outline: exactly one h1, no skipped levels.
  const headings = await page.evaluate(() => {
    const hs = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(
      (h) => (h as HTMLElement).offsetParent !== null
    )
    const problems: string[] = []
    const levels = hs.map((h) => parseInt(h.tagName[1] as string, 10))
    const h1Count = levels.filter((l) => l === 1).length
    if (h1Count === 0) problems.push('no <h1> on page')
    if (h1Count > 1) problems.push(`multiple <h1> (${h1Count})`)
    for (let i = 1; i < levels.length; i++) {
      const prev = levels[i - 1] as number
      const cur = levels[i] as number
      if (cur - prev > 1) {
        problems.push(`heading level jumps from h${prev} to h${cur}`)
      }
    }
    return problems
  })

  // 3. Landmarks: a main region must exist; nav recommended.
  const landmarks = await page.evaluate(() => {
    const problems: string[] = []
    const hasMain = document.querySelector('main, [role="main"]') !== null
    if (!hasMain) problems.push('no <main>/role="main" landmark')
    return problems
  })

  // 4. Keyboard: focus order is reachable, focus is visible, no trap.
  const keyboard: string[] = []
  if (!options?.skipKeyboardWalk) {
    const maxStops = options?.maxTabStops ?? 25
    const seen = new Set<string>()
    let movedAtLeastOnce = false
    let trapDetected = false
    let lastFocusIndex = -1
    let repeatCount = 0

    for (let i = 0; i < maxStops; i++) {
      await page.keyboard.press('Tab')
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el || el === document.body) return null
        const style = getComputedStyle(el)
        const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
        const hasShadow = style.boxShadow !== 'none'
        const tag = el.tagName.toLowerCase()
        const sig = `${tag}#${el.id}.${el.className}`.slice(0, 80)
        const domIndex = Array.prototype.indexOf.call(document.querySelectorAll('*'), el)
        return { sig, domIndex, hasOutline, hasShadow, tag }
      })
      if (!info) continue
      movedAtLeastOnce = true

      if (info.domIndex === lastFocusIndex) {
        repeatCount++
        if (repeatCount >= 3) {
          trapDetected = true
          break
        }
      } else {
        repeatCount = 0
      }
      lastFocusIndex = info.domIndex

      if (!seen.has(info.sig)) {
        seen.add(info.sig)
        if (!info.hasOutline && !info.hasShadow) {
          keyboard.push(`element <${info.tag}> receives focus with no visible focus indicator`)
        }
      }
    }
    if (!movedAtLeastOnce) keyboard.push('Tab key does not move focus to any control')
    if (trapDetected) keyboard.push('keyboard focus appears trapped on one element')
  }

  const result: InspectorResult = {
    unnamed,
    headings,
    landmarks,
    keyboard: Array.from(new Set(keyboard)).slice(0, 10),
  }

  const total =
    result.unnamed.length +
    result.headings.length +
    result.landmarks.length +
    result.keyboard.length

  if (total > 0) {
    const parts: string[] = []
    if (result.unnamed.length)
      parts.push(
        `Interactive elements without accessible name:\n  - ${result.unnamed.join('\n  - ')}`
      )
    if (result.headings.length)
      parts.push(`Heading outline:\n  - ${result.headings.join('\n  - ')}`)
    if (result.landmarks.length) parts.push(`Landmarks:\n  - ${result.landmarks.join('\n  - ')}`)
    if (result.keyboard.length)
      parts.push(`Keyboard / focus:\n  - ${result.keyboard.join('\n  - ')}`)
    expect(total, `Accessibility inspector findings:\n${parts.join('\n')}`).toBe(0)
  }
}
