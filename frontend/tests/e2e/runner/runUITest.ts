/**
 * runUITest - unified E2E test engine.
 *
 * For a given page/component it runs in a single call:
 *   1. Functional check  (baseline only: de + light + desktop)
 *   2. Visual regression (DE + light + desktop viewport ONLY, strict baseline)
 *   3. Minimal screenshots (documentation + exactly two marketing shots)
 *   4. Accessibility scan (axe-core WCAG 2.1 AA, desktop viewport only)
 *   5. Accessibility inspector (keyboard/focus/name/heading/landmark checks that
 *      axe misses, runs once per page on the strict baseline variant)
 *   6. Contrast / colour audit (axe colour-contrast + use-of-colour, per theme)
 *      plus either automated CVD checks or optional simulation artifacts
 *   7. Screen-reader audit (accessibility tree + document title, baseline variant)
 *
 * Modes:
 *   smoke (default)   :    DE + light + desktop (1552×920) + Chromium
 *                          -> 1 navigation per spec
 *   Nightly (schedule):    EN+DE × light+dark + Chromium+Firefox
 *                          -> 3 navigations per spec (de, en, marketing if needed)
 *                          Theme switch reuses the same page load (no re-navigate).
 *                          Mobile viewport skipped for a11y (covered by desktop).
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
import {
  checkContrast,
  captureColorBlindSimulations,
  checkContrastUnderColorBlindSimulations,
} from '../utils/contrast'
import { auditScreenReader } from '../utils/screenreader'
import { viewports } from '../utils/viewports'

const isNightly = process.env.CI_PIPELINE_SOURCE === 'schedule'

const SKIP_VISUAL_REGRESSION = process.env.SKIP_VISUAL_REGRESSION === '1'

const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || '../screenshots'
const DOCS_DIR = `${SCREENSHOT_DIR}/documentation`
const MARKETING_DIR = `${SCREENSHOT_DIR}/marketing`

const COLORBLIND_REVIEW_MODE = process.env.COLORBLIND_REVIEW_MODE || 'auto'

const ALLOWED_MARKETING_SHOTS = new Set([
  'opsi-webgui-dashboard',
  'opsi-webgui-clients-with-products',
])

/**
 * Regions that change every run and must be masked out of every visual
 * regression screenshot (the quickpanel session-countdown timer ticks once a
 * second).
 */
const VOLATILE_MASK = '[data-testid="session-timer"]'

function docsPath(docName: string, locale: Locale, theme: Theme): string {
  return `${DOCS_DIR}/${locale}/${theme}/${docName}.png`
}

function marketingPath(name: string, locale: Locale, theme: Theme): string {
  return `${MARKETING_DIR}/${locale}/${theme}/${name}.png`
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

function docElementPath(shotName: string, locale: Locale, theme: Theme): string {
  return `${DOCS_DIR}/${locale}/${theme}/elements/${shotName}.png`
}

function shotSelector(testId?: string, selector?: string): string {
  if (testId) return `[data-testid="${testId}"]`
  if (selector) return selector
  throw new Error('ElementShot requires either testId or selector')
}

async function captureElement(page: Page, shot: ElementShot, path: string): Promise<void> {
  try {
    if (shot.before) await shot.before(page)
  } catch {
    // before hook failed (e.g. button not found) ; skip this element shot
    return
  }
  const sel = shot.captureTestId
    ? shotSelector(shot.captureTestId)
    : shot.captureSelector
      ? shot.captureSelector
      : shotSelector(shot.testId, shot.selector)
  const loc = page.locator(sel).first()
  try {
    await loc.waitFor({ state: 'visible', timeout: 5000 })
    await loc.scrollIntoViewIfNeeded()
    await loc.screenshot({ path })
  } catch {
    // element not visible within timeout; skip this shot gracefully
  } finally {
    // always run after (e.g. close dialog / press Escape) even if screenshot failed
    if (shot.after) {
      try {
        await shot.after(page)
      } catch {
        /* best-effort cleanup */
      }
    }
  }
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
  marketingName?: string
  marketingPrepare?: (page: Page) => Promise<void>
}

// Helper: scroll to the very bottom and back to top so that lazy loaders render their content before the VR screenshot.
async function scrollToRevealAll(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
}

// Helper: navigate once, set locale + theme, disable animations, wait for load.
async function navigateTo(
  page: Page,
  config: UITestConfig,
  locale: Locale,
  theme: Theme
): Promise<void> {
  await page.setViewportSize(viewports['desktop'])
  await applyLocaleCookie(page, locale)
  await page.goto(config.route, { waitUntil: 'load', timeout: 30000 })
  await page.waitForTimeout(config.waitAfterNav || 3000)
  if (!config.route.includes('/login')) {
    await setTheme(page, theme)
    await setLocale(page, locale)
    await page.waitForTimeout(300)
  }
  await disableAnimations(page)
  await waitForLoaded(page)

  const tryLoginRecovery = async (): Promise<void> => {
    if (config.route.includes('/login')) return
    if (!/\/login(?:\?|$|\/)/.test(page.url())) return

    const usernameInput = page
      .locator('#login-username, input[autocomplete="username"], input[aria-label*="user" i], input[placeholder*="user" i], input[placeholder*="benutzer" i]')
      .first()
    const passwordInput = page.locator('#login-password, input[type="password"]').first()
    const canLogin = await Promise.all([
      usernameInput.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false),
      passwordInput.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false),
    ]).then(([u, p]) => u && p)

    if (!canLogin) return

    const testUser = process.env.TEST_USER || 'adminuser'
    const testPassword = process.env.TEST_PASSWORD || 'adminuser'
    await usernameInput.fill(testUser)
    await passwordInput.fill(testPassword)
    await page.locator('button[type="submit"]').first().click()
    await page.waitForURL((current) => !/\/login(?:\?|$|\/)/.test(`${current.pathname}${current.search}`), {
      timeout: 30000,
    })
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined)
  }

  await tryLoginRecovery()

  if (!config.route.includes('/login') && /\/login(?:\?|$|\/)/.test(page.url())) {
    await page.goto(config.route, { waitUntil: 'load', timeout: 30000 }).catch(() => undefined)
    await page.waitForTimeout(config.waitAfterNav || 3000)
    await disableAnimations(page)
    await waitForLoaded(page)
    await tryLoginRecovery()
  }

  // Firefox occasionally lands on a half-rendered shell on first navigation.
  // One soft reload here is cheaper than many spec-level retries.
  const browserName = page.context().browser()?.browserType().name()
  if (browserName === 'firefox' && !config.route.includes('/login')) {
    const shell = page.locator('main, #main-content, [data-testid="main-content"]').first()
    const shellVisible = await shell.isVisible().catch(() => false)
    if (!shellVisible) {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => undefined)
      await page.waitForTimeout(1000)
      await disableAnimations(page)
      await waitForLoaded(page)
      await tryLoginRecovery()
    }
  }
}

// Helper: switch theme in-place (no re-navigation).
async function switchTheme(page: Page, theme: Theme): Promise<void> {
  await setTheme(page, theme)
  await page.waitForTimeout(300)
  await disableAnimations(page)
}

// Helper: take VR screenshot with full-page reveal and masking.
async function takeVRScreenshot(page: Page, config: UITestConfig): Promise<void> {
  if (config.skipVisualRegression || SKIP_VISUAL_REGRESSION) return
  const browserName = page.context().browser()?.browserType().name()
  // Visual baselines are browser-specific; keep strict VR on Chromium only.
  if (browserName && browserName !== 'chromium') return
  await scrollToRevealAll(page)
  await page.mouse.move(0, 0)
  await page.waitForTimeout(50)
  const maskSelectors = [VOLATILE_MASK, ...(config.vrMask || [])]
  const masks = maskSelectors.map((sel) => page.locator(sel))
  await expect(page).toHaveScreenshot(`${config.name}.png`, {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
    threshold: 0.2,
    maskColor: '#ffffff',
    mask: masks,
  })
}

// Helper: run a11y + contrast checks.
async function runA11yChecks(
  page: Page,
  config: UITestConfig,
  opts: { inspector?: boolean; colorBlind?: boolean; screenReader?: boolean }
): Promise<void> {
  const exclude = config.a11yExclude ? { exclude: config.a11yExclude } : undefined
  if (!config.skipA11y) {
    await checkA11y(page, exclude)
  }
  if (!config.skipContrast) {
    await checkContrast(page, exclude)
    if (opts.colorBlind) {
      if (COLORBLIND_REVIEW_MODE === 'auto') {
        await checkContrastUnderColorBlindSimulations(page, exclude)
      } else if (COLORBLIND_REVIEW_MODE === 'artifacts') {
        await captureColorBlindSimulations(page, config.name, `${SCREENSHOT_DIR}/colorblind`)
      }
    }
  }
  if (opts.inspector && !config.skipInspector) {
    const browserName = page.context().browser()?.browserType().name()
    const skipKeyboardWalk = config.skipKeyboardWalk || browserName === 'firefox'
    await inspectA11y(page, {
      exclude: config.a11yExclude,
      skipKeyboardWalk,
    })
  }
  if (opts.screenReader && !config.skipScreenReader) {
    await auditScreenReader(page, { name: config.name })
  }
}

/**
 * Unified test engine. Call once per page spec, it handles the full matrix.
 *
 * Execution plan (minimises navigations):
 *
 *  Smoke  (default): 1 navigation  - de+light+desktop, full suite
 *  Nightly (schedule):
 *    nav 1  de+light   -> full suite (VR + a11y + inspector + colorblind + SR)
 *               dark   -> a11y + contrast (in-place theme switch, no re-nav)
 *    nav 2  en+light   -> a11y + contrast + doc screenshot
 *               dark   -> a11y + contrast (in-place theme switch, no re-nav)
 *    nav 3  (only if marketingName) de+light at marketing viewport
 *               dark   -> marketing dark screenshot (in-place theme switch)
 *
 * Mobile viewport is SKIPPED for a11y/contrast (covered by desktop).
 * Functional check runs ONCE (de+light+desktop baseline).
 */
export async function runUITest(page: Page, config: UITestConfig): Promise<void> {
  const browserName = page.context().browser()?.browserType().name()
  const shouldCaptureDocs = isNightly && browserName === 'chromium'

  //  Phase 1: Baseline - de + light + desktop
  await navigateTo(page, config, 'de', 'light')

  if (config.functional) {
    await config.functional(page)
    await waitForLoaded(page)
  }

  // 2. Visual regression
  await takeVRScreenshot(page, config)

  // 4/5/6/7: a11y suite (light)
  await runA11yChecks(page, config, {
    inspector: true,
    colorBlind: true,
    screenReader: true,
  })

  // 3. Doc screenshot : de + light
  if (shouldCaptureDocs) {
    if (config.docName) {
      await scrollToRevealAll(page)
      await page.screenshot({ path: docsPath(config.docName, 'de', 'light'), fullPage: true })
    }
    for (const shot of config.elementShots || []) {
      await captureElement(page, shot, docElementPath(shot.name, 'de', 'light'))
    }
  }

  // Phase 2 (nightly only): in-place dark switch on the de navigation
  if (isNightly) {
    await switchTheme(page, 'dark')
    await runA11yChecks(page, config, {})

    // Doc screenshot : de + dark (if docDarkMode)
    if (shouldCaptureDocs && config.docName && config.docDarkMode) {
      await scrollToRevealAll(page)
      await page.screenshot({ path: docsPath(config.docName, 'de', 'dark'), fullPage: true })
    }

    // Reset back to light for next navigation
    await switchTheme(page, 'light')

    // Phase 3 (nightly): en + light + standard
    await navigateTo(page, config, 'en', 'light')
    await runA11yChecks(page, config, {})

    // Doc screenshot : en + light
    if (shouldCaptureDocs) {
      if (config.docName) {
        await scrollToRevealAll(page)
        await page.screenshot({ path: docsPath(config.docName, 'en', 'light'), fullPage: true })
      }
      for (const shot of config.elementShots || []) {
        await captureElement(page, shot, docElementPath(shot.name, 'en', 'light'))
      }
    }

    // Phase 4 (nightly): en + dark (in-place theme switch)
    await switchTheme(page, 'dark')
    await runA11yChecks(page, config, {})

    // Doc screenshot : en + dark (if docDarkMode)
    if (shouldCaptureDocs && config.docName && config.docDarkMode) {
      await scrollToRevealAll(page)
      await page.screenshot({ path: docsPath(config.docName, 'en', 'dark'), fullPage: true })
    }

    await switchTheme(page, 'light')

    // Phase 5 (nightly): marketing viewport (only if spec has marketingName)
    if (browserName === 'chromium' && config.marketingName && ALLOWED_MARKETING_SHOTS.has(config.marketingName)) {
      for (const locale of ['de', 'en'] as Locale[]) {
        await applyLocaleCookie(page, locale)
        await page.setViewportSize(viewports['marketing'])
        await page.goto(config.route, { waitUntil: 'load', timeout: 30000 })
        await page.waitForTimeout(config.waitAfterNav || 3000)
        await setTheme(page, 'light')
        await setLocale(page, locale)
        await page.waitForTimeout(300)
        await disableAnimations(page)
        await waitForLoaded(page)

        if (config.marketingPrepare) {
          await config.marketingPrepare(page)
          await waitForLoaded(page)
        }
        await page.screenshot({
          path: marketingPath(config.marketingName, locale, 'light'),
          fullPage: true,
        })

        // dark marketing
        await switchTheme(page, 'dark')
        if (config.marketingPrepare) {
          await config.marketingPrepare(page)
          await waitForLoaded(page)
        }
        await page.screenshot({
          path: marketingPath(config.marketingName, locale, 'dark'),
          fullPage: true,
        })
        await switchTheme(page, 'light')
      }
    }
  }
}
