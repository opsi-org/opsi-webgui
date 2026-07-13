/**
 * Standard viewport definitions for E2E tests.
 */

export const viewports = {
  desktop: { width: 1552, height: 920 },
  marketing: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 812 },
} as const

export type ViewportName = keyof typeof viewports
