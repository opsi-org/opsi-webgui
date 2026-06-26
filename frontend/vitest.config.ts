import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.spec.ts'],
    setupFiles: ['tests/unit/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'cobertura', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['app/utils/**', 'app/composables/**'],
      exclude: ['**/*.d.ts', '**/types/**'],
    },
  },
  resolve: {
    alias: {
      '~/types': path.resolve(__dirname, 'app/types'),
      '~/stores': path.resolve(__dirname, 'app/stores'),
      '~': path.resolve(__dirname),
      '@': path.resolve(__dirname),
    },
  },
})
