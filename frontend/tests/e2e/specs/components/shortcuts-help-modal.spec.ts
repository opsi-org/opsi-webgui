import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'

test.describe('Keyboard shortcuts help modal', () => {
  test('opening keyboard shortcut help modal', async ({ page }) => {
    await runUITest(page, {
      name: 'layout-app-keyboard-shortcut-helper',
      route: '/clients',
      waitAfterNav: 3000,
      skipVisualRegression: true,
      docName: 'opsi-webgui-keyboard-shortcut-helper',
      prepareAfterNavigation: async (p) => {
        await p.keyboard.press('Control+Shift+?')
      },
      functional: async (p) => {
        const modal = p.getByRole('dialog')
        await expect(modal).toBeVisible({ timeout: 10000 })
      },
    })
  })
})
