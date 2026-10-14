import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const frontendRoot = resolve(import.meta.dirname, '../../..')
const appRoot = resolve(frontendRoot, 'app')
const sourceFiles = readdirSync(appRoot, { recursive: true, encoding: 'utf8' }).filter((file) => /\.(vue|ts|js)$/.test(file))

function flattenMessages(messages: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(messages)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') result[fullKey] = value
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenMessages(value as Record<string, unknown>, fullKey))
    }
  }
  return result
}

describe.each(['en', 'de', 'fr'])('translation coverage (%s)', (locale) => {
  const messages = flattenMessages(JSON.parse(readFileSync(resolve(frontendRoot, `i18n/locales/opsi-webgui_${locale}.json`), 'utf8')))

  it('defines literal translation calls and table column labels', () => {
    const missing: string[] = []
    for (const file of sourceFiles) {
      const source = readFileSync(resolve(appRoot, file), 'utf8')
      const references = source.matchAll(/(?:(?:\$t|i18nT|\bt)\(\s*|labelKey:\s*)['"]([^'"]+)['"]/g)
      for (const match of references) {
        if (!messages[match[1]!]) missing.push(`${file}: ${match[1]}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('defines every sidebar label', () => {
    const source = readFileSync(resolve(appRoot, 'components/layouts/Sidebar.vue'), 'utf8')
    const labels = [...source.matchAll(/title: '([^']+)'/g)].map((match) => match[1]!)
    expect(labels).toHaveLength(10)
    expect(labels.filter((key) => !messages[key])).toEqual([])
  })
})
