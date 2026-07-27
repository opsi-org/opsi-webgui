#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const targetPath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('../sbom.cyclonedx.json')

if (!fs.existsSync(targetPath)) {
	console.error(`SBOM file not found: ${targetPath}`)
	process.exit(1)
}

/**
 * cdxgen emits npm scopes in `group` and base package in `name`.
 * Some downstream scanners incorrectly key on `name` only.
 * Normalize to scoped names (`@scope/name`) for npm components.
 */
function normalizeComponentName(component) {
	if (!component || typeof component !== 'object') return

	const group = typeof component.group === 'string' ? component.group.trim() : ''
	const name = typeof component.name === 'string' ? component.name.trim() : ''

	if (!group || !name || !group.startsWith('@') || name.startsWith('@')) {
		return
	}

	component.name = `${group}/${name}`
}

const sbom = JSON.parse(fs.readFileSync(targetPath, 'utf8'))

if (Array.isArray(sbom.components)) {
	for (const component of sbom.components) normalizeComponentName(component)
}

if (sbom.metadata?.component) {
	normalizeComponentName(sbom.metadata.component)
}

fs.writeFileSync(targetPath, `${JSON.stringify(sbom, null, 2)}\n`, 'utf8')

console.log(`Normalized scoped npm component names in ${targetPath}`)