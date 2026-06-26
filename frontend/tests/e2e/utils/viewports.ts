/**
 * Standard viewport definitions for E2E tests.
 */

export const viewports = {
  standard: { width: 1280, height: 800 },
  desktop: { width: 1440, height: 900 },
  marketing: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 812 },
} as const

export type ViewportName = keyof typeof viewports
