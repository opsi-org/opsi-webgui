/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import { defineConfig } from 'vitest/config'
import path from 'node:path'

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
    isolate: false,
  },
  resolve: {
    alias: {
      '~/types': path.resolve(import.meta.dirname, 'app/types'),
      '~/stores': path.resolve(import.meta.dirname, 'app/stores'),
      '~/utils': path.resolve(import.meta.dirname, 'app/utils'),
      '~': path.resolve(import.meta.dirname),
      '@': path.resolve(import.meta.dirname),
    },
  },
})
