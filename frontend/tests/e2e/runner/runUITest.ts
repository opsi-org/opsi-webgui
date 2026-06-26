/**
 * runUITest — unified E2E test engine.
 *
 * For a given page/component it runs in a single call:
 *   1. Functional check
 *   2. Visual regression (DE + light + standard viewport ONLY, strict baseline)
 *   3. Matrix screenshots (all locale × theme × viewport combinations)
 *   4. Accessibility scan (axe-core WCAG 2.1 AA on every variant)
 *   5. Accessibility inspector (keyboard/focus/name/heading/landmark checks that
 *      axe misses, runs once per page on the strict baseline variant)
 *   6. Contrast / colour audit (axe colour-contrast + use-of-colour, per theme)
 *      plus colour-blind (protanopia/deuteranopia/tritanopia) simulation shots
 *   7. Screen-reader audit (accessibility tree + document title, baseline variant)
 *
 * Modes:
 *   smoke (default)   :    DE + light + desktop (1280×800) + Chromium
 *   Nightly (schedule):    EN+DE × light+dark × desktop+mobile + Chromium+Firefox
 */

import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  setTheme,
  setLocale,
  applyLocaleCookie,
  disableAnimations,
  waitForLoaded,
  type Theme,
  type Locale,
} from '../utils/ui'
import { checkA11y } from '../utils/a11y'
import { inspectA11y } from '../utils/inspector'
import { checkContrast, captureColorBlindSimulations } from '../utils/contrast'
import { auditScreenReader } from '../utils/screenreader'
import { viewports, type ViewportName } from '../utils/viewports'

const isNightly = process.env.CI_PIPELINE_SOURCE === 'schedule'

const SKIP_VISUAL_REGRESSION = process.env.SKIP_VISUAL_REGRESSION === '1'

const SMOKE_LOCALES: Locale[] = ['de']
const SMOKE_THEMES: Theme[] = ['light']
const SMOKE_VIEWPORTS: ViewportName[] = ['standard']

const NIGHTLY_LOCALES: Locale[] = ['en', 'de']
const NIGHTLY_THEMES: Theme[] = ['light', 'dark']
const NIGHTLY_VIEWPORTS: ViewportName[] = ['standard', 'mobile', 'marketing']

function getLocales(): Locale[] {
  return isNightly ? NIGHTLY_LOCALES : SMOKE_LOCALES
}

function getThemes(): Theme[] {
  return isNightly ? NIGHTLY_THEMES : SMOKE_THEMES
}

function getViewports(): ViewportName[] {
  return isNightly ? NIGHTLY_VIEWPORTS : SMOKE_VIEWPORTS
}

const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || 'screenshots'

/**
 * Regions that change every run and must be masked out of every visual
 * regression screenshot (the quickpanel session-countdown timer ticks once a
 * second).
 */
const VOLATILE_MASK = '[data-testid="session-timer"]'

function screenshotPath(
  name: string,
  locale: Locale,
  theme: Theme,
  viewport: ViewportName
): string {
  return `${SCREENSHOT_DIR}/${locale}/${theme}/${viewport}/${name}.png`
}

// ---------------------------------------------------------------------------
// Documentation captures.
//
// opsidoc needs, per documented view: a light-mode full-page screenshot in
// English AND German, plus exactly ONE dark-mode screenshot across the whole
// docs set (a single representative page, flagged with `docDarkMode`).
// Cropped element images (buttons, dropdowns, menus) are produced from test ids
// via `elementShots` so nothing has to be cropped by hand.
// ---------------------------------------------------------------------------

/** Locale used for the single dark-mode documentation screenshot. */
const DOC_DARK_LOCALE: Locale = 'en'

function docPath(docName: string, dir: 'en' | 'de' | 'dark'): string {
  return `${SCREENSHOT_DIR}/docs/${dir}/${docName}.png`
}

function docElementPath(shotName: string, locale: Locale): string {
  return `${SCREENSHOT_DIR}/docs/${locale}/elements/${shotName}.png`
}

function shotSelector(testId?: string, selector?: string): string {
  if (testId) return `[data-testid="${testId}"]`
  if (selector) return selector
  throw new Error('ElementShot requires either testId or selector')
}

async function captureElement(page: Page, shot: ElementShot, path: string): Promise<void> {
  if (shot.before) await shot.before(page)
  const sel = shot.captureTestId
    ? shotSelector(shot.captureTestId)
    : shot.captureSelector
      ? shot.captureSelector
      : shotSelector(shot.testId, shot.selector)
  const loc = page.locator(sel).first()
  await loc.waitFor({ state: 'visible', timeout: 5000 })
  await loc.scrollIntoViewIfNeeded()
  await loc.screenshot({ path })
  if (shot.after) await shot.after(page)
}

export interface ElementShot {
  name: string
  testId?: string
  selector?: string
  before?: (page: Page) => Promise<void>
  after?: (page: Page) => Promise<void>
  captureTestId?: string
  captureSelector?: string
}

export interface UITestConfig {
  name: string
  route: string
  waitAfterNav?: number
  functional?: (page: Page) => Promise<void>
  skipA11y?: boolean
  a11yExclude?: string[]
  skipInspector?: boolean
  skipKeyboardWalk?: boolean
  skipContrast?: boolean
  skipScreenReader?: boolean
  skipVisualRegression?: boolean
  vrMask?: string[]
  docName?: string
  docDarkMode?: boolean
  elementShots?: ElementShot[]
}

/**
 * Unified test engine. Call once per page spec, it handles the full matrix.
 */
export async function runUITest(page: Page, config: UITestConfig): Promise<void> {
  const locales = getLocales()
  const themes = getThemes()
  const vps = getViewports()

  for (const locale of locales) {
    for (const theme of themes) {
      for (const vp of vps) {
        // Set viewport
        await page.setViewportSize(viewports[vp])

        await applyLocaleCookie(page, locale)

        // Navigate
        await page.goto(config.route, { waitUntil: 'load', timeout: 30000 })
        await page.waitForTimeout(config.waitAfterNav || 3000)

        // Apply theme & locale (skip on login page)
        if (!config.route.includes('/login')) {
          await setTheme(page, theme)
          await setLocale(page, locale)
          await page.waitForTimeout(300)
        }

        // Disable animations for stable screenshots
        await disableAnimations(page)

        // Wait for any loading spinners to settle
        await waitForLoaded(page)

        // 1. Functional check
        if (config.functional) {
          await config.functional(page)
          // The functional callback may navigate tabs / load more data.
          await waitForLoaded(page)
        }

        // 2. Visual regression: only DE + light + standard viewport
        if (
          !config.skipVisualRegression &&
          !SKIP_VISUAL_REGRESSION &&
          locale === 'de' &&
          theme === 'light' &&
          vp === 'standard'
        ) {
          // Spec-specific masks for volatile regions (timestamps, counters)
          // and session-countdown timer in the quickpanel
          const maskSelectors = [VOLATILE_MASK, ...(config.vrMask || [])]
          const masks = maskSelectors.map((sel) => page.locator(sel))
          await expect(page).toHaveScreenshot(`${config.name}.png`, {
            fullPage: true,
            // Tolerant enough that dev-container baselines pass in CI (font AA
            // differs between the dev image and the CI Playwright image).
            maxDiffPixelRatio: 0.05,
            threshold: 0.2,
            // Light-mode --color-background so masked volatile regions (the
            // session countdown timer) blend in instead of the default magenta.
            maskColor: '#ffffff',
            mask: masks,
          })
        }

        // 3. Matrix screenshot (all variants -> CI artifacts for docs/marketing)
        await page.screenshot({
          path: screenshotPath(config.name, locale, theme, vp),
          fullPage: true,
        })

        if (
          config.docName &&
          theme === 'light' &&
          vp === 'standard' &&
          (locale === 'en' || locale === 'de')
        ) {
          await page.screenshot({ path: docPath(config.docName, locale), fullPage: true })
          for (const shot of config.elementShots || []) {
            await captureElement(page, shot, docElementPath(shot.name, locale))
          }
        }
        // The single dark-mode documentation screenshot.
        if (
          config.docName &&
          config.docDarkMode &&
          theme === 'dark' &&
          vp === 'standard' &&
          locale === DOC_DARK_LOCALE
        ) {
          await page.screenshot({ path: docPath(config.docName, 'dark'), fullPage: true })
        }

        // 4. Accessibility scan (axe-core, every variant)
        if (!config.skipA11y) {
          await checkA11y(page, config.a11yExclude ? { exclude: config.a11yExclude } : undefined)
        }

        // 5. Accessibility inspector (manual-style checks axe misses).
        if (!config.skipInspector && locale === 'de' && theme === 'light' && vp === 'standard') {
          await inspectA11y(page, {
            exclude: config.a11yExclude,
            skipKeyboardWalk: config.skipKeyboardWalk,
          })
        }

        // 6. Contrast / colour audit.
        if (!config.skipContrast && locale === 'de' && vp === 'standard') {
          await checkContrast(
            page,
            config.a11yExclude ? { exclude: config.a11yExclude } : undefined
          )

          // Colour-blind simulation screenshots -> CI artifacts for review.
          if (theme === 'light') {
            await captureColorBlindSimulations(page, config.name, `${SCREENSHOT_DIR}/colorblind`)
          }
        }

        // 7. Screen-reader audit (accessibility tree / document title).
        if (!config.skipScreenReader && locale === 'de' && theme === 'light' && vp === 'standard') {
          await auditScreenReader(page, { name: config.name })
        }
      }
    }
  }

  if (!themes.includes('dark') && !config.skipA11y && !config.route.includes('/login')) {
    await page.setViewportSize(viewports['standard'])
    await page.goto(config.route, { waitUntil: 'load', timeout: 30000 })
    await page.waitForTimeout(config.waitAfterNav || 3000)
    await setTheme(page, 'dark')
    await setLocale(page, 'de')
    await page.waitForTimeout(300)
    await disableAnimations(page)
    await checkA11y(page, config.a11yExclude ? { exclude: config.a11yExclude } : undefined)
    if (!config.skipContrast) {
      await checkContrast(page, config.a11yExclude ? { exclude: config.a11yExclude } : undefined)
    }
    // Reset back to light
    await setTheme(page, 'light')
  }
}
