/**
 * This file is part of opsi-webgui.
 * Copyright (c) uib GmbH <info@uib.de>
 * License: AGPL-3.0
 *
 * Contrast & colour-vision accessibility checks.
 */

import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/** NuxtUI false-positive exclusions */
const NUXTUI_EXCLUSIONS = ['[data-grace-area-trigger]', 'button[role="checkbox"][data-slot="base"]']

export interface ContrastOptions {
  exclude?: string[]
}

export async function checkContrast(page: Page, options?: ContrastOptions): Promise<void> {
  let builder = new AxeBuilder({ page }).withRules(['color-contrast', 'link-in-text-block'])

  const exclusions = [...NUXTUI_EXCLUSIONS, ...(options?.exclude || [])]
  for (const sel of exclusions) {
    builder = builder.exclude(sel)
  }

  const results = await builder.analyze()

  if (results.violations.length > 0) {
    const summary = results.violations
      .map((v) => {
        const nodes = v.nodes
          .slice(0, 5)
          .map((n) => {
            const detail = n.any?.[0]?.message || n.failureSummary || ''
            return `      • ${n.target.join(' ')}${detail ? `\n        ${detail.replace(/\n/g, ' ')}` : ''}`
          })
          .join('\n')
        return `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length > 1 ? 's' : ''})\n${nodes}`
      })
      .join('\n')
    expect(results.violations.length, `Contrast / colour violations:\n${summary}`).toBe(0)
  }
}

// ---------------------------------------------------------------------------
// Colour-vision-deficiency simulation
// ---------------------------------------------------------------------------

/**
 * feColorMatrix values approximating the three dichromacies
 * (Machado et al. 2009, severity 1.0 - the matrices widely used by Chrome
 * DevTools' "Emulate vision deficiencies" panel).
 */
const CVD_MATRICES: Record<string, string> = {
  protanopia: '0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0',
  deuteranopia: '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0',
  tritanopia: '0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0',
}

export type CvdType = keyof typeof CVD_MATRICES

async function ensureCvdFilters(page: Page): Promise<void> {
  await page.evaluate((matrices: Record<string, string>) => {
    if (document.getElementById('cvd-filters')) return
    const svgNs = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNs, 'svg')
    svg.setAttribute('id', 'cvd-filters')
    svg.setAttribute('aria-hidden', 'true')
    svg.style.position = 'absolute'
    svg.style.width = '0'
    svg.style.height = '0'
    for (const [name, values] of Object.entries(matrices)) {
      const filter = document.createElementNS(svgNs, 'filter')
      filter.setAttribute('id', `cvd-${name}`)
      const fe = document.createElementNS(svgNs, 'feColorMatrix')
      fe.setAttribute('type', 'matrix')
      fe.setAttribute('values', values)
      filter.appendChild(fe)
      svg.appendChild(filter)
    }
    document.body.appendChild(svg)
  }, CVD_MATRICES)
}

async function applyCvd(page: Page, type: CvdType | null): Promise<void> {
  await page.evaluate((id: string | null) => {
    document.documentElement.style.filter = id ? `url(#cvd-${id})` : ''
  }, type)
}

export async function captureColorBlindSimulations(
  page: Page,
  name: string,
  dir: string
): Promise<void> {
  await ensureCvdFilters(page)
  for (const type of Object.keys(CVD_MATRICES) as CvdType[]) {
    await applyCvd(page, type)
    await page.screenshot({ path: `${dir}/${name}-${type}.png`, fullPage: true })
  }
  await applyCvd(page, null)
}

/**
 * Automated colour-blind accessibility gate.
 *
 * Runs the same axe contrast checks under protanopia/deuteranopia/tritanopia
 * simulation filters. This replaces manual image inspection when desired.
 */
export async function checkContrastUnderColorBlindSimulations(
  page: Page,
  options?: ContrastOptions
): Promise<void> {
  await ensureCvdFilters(page)
  for (const type of Object.keys(CVD_MATRICES) as CvdType[]) {
    await applyCvd(page, type)
    await checkContrast(page, options)
  }
  await applyCvd(page, null)
}
