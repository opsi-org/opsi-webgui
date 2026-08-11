#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)

let inputFile = null
let omitDev = false
let devScope = 'optional'
let runtimeOnly = false
let stripDependencyRiskMetadata = false

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i]

  if (arg === '--omit-dev') {
    omitDev = true
    continue
  }

  if (arg === '--runtime-only') {
    runtimeOnly = true
    continue
  }

  if (arg === '--strip-dependency-risk-metadata') {
    stripDependencyRiskMetadata = true
    continue
  }

  if (arg === '--file' && args[i + 1]) {
    inputFile = args[i + 1]
    i += 1
    continue
  }

  if (arg === '--dev-scope' && args[i + 1]) {
    devScope = args[i + 1]
    i += 1
    continue
  }

  if (!arg.startsWith('--') && !inputFile) {
    inputFile = arg
  }
}

const targetPath = inputFile ? path.resolve(inputFile) : path.resolve('../sbom.cyclonedx.json')

if (!['required', 'optional', 'excluded'].includes(devScope)) {
  console.error(`Invalid --dev-scope '${devScope}'. Allowed values: required, optional, excluded`)
  process.exit(1)
}

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
  component.group = ''
}

function hasDevProperty(component) {
  if (!component || typeof component !== 'object' || !Array.isArray(component.properties)) {
    return false
  }

  return component.properties.some((property) => {
    if (!property || typeof property !== 'object') return false
    return (
      property.name === 'cdx:npm:package:development' &&
      String(property.value).toLowerCase() === 'true'
    )
  })
}

function buildReachableRefs(sbom) {
  const rootRef = sbom?.metadata?.component?.['bom-ref']

  if (!rootRef || !Array.isArray(sbom?.dependencies)) {
    return new Set()
  }

  const graph = new Map(
    sbom.dependencies.map((entry) => [
      entry?.ref,
      Array.isArray(entry?.dependsOn) ? entry.dependsOn.filter(Boolean) : [],
    ])
  )

  const reachableRefs = new Set([rootRef])
  const stack = [rootRef]

  while (stack.length > 0) {
    const ref = stack.pop()
    const dependsOn = graph.get(ref) || []

    for (const dependencyRef of dependsOn) {
      if (reachableRefs.has(dependencyRef)) {
        continue
      }

      reachableRefs.add(dependencyRef)
      stack.push(dependencyRef)
    }
  }

  return reachableRefs
}

function stripRiskMetadata(component) {
  if (!component || typeof component !== 'object' || !Array.isArray(component.properties)) {
    return false
  }

  const originalLength = component.properties.length
  component.properties = component.properties.filter((property) => {
    const propertyName = property?.name
    return propertyName !== 'cdx:npm:hasInstallScript' && propertyName !== 'cdx:npm:risky_scripts'
  })

  if (component.properties.length === 0) {
    delete component.properties
  }

  return (
    component.properties?.length !== originalLength || (originalLength > 0 && !component.properties)
  )
}

function getComponentNamespace(component) {
  if (!component || typeof component !== 'object') {
    return ''
  }

  const group = typeof component.group === 'string' ? component.group.trim() : ''

  if (group.startsWith('@')) {
    return group
  }

  const name = typeof component.name === 'string' ? component.name.trim() : ''

  if (name.startsWith('@') && name.includes('/')) {
    return name.split('/')[0]
  }

  return ''
}

function updateMetadataNamespaces(sbom) {
  if (!Array.isArray(sbom?.components) || !Array.isArray(sbom?.metadata?.properties)) {
    return
  }

  const namespaces = [...new Set(sbom.components.map(getComponentNamespace).filter(Boolean))].sort()
  const namespaceValue = namespaces.join('\n')
  const namespaceProperty = sbom.metadata.properties.find(
    (property) => property?.name === 'cdx:bom:componentNamespaces'
  )

  if (!namespaceProperty) {
    if (namespaceValue) {
      sbom.metadata.properties.push({ name: 'cdx:bom:componentNamespaces', value: namespaceValue })
    }
    return
  }

  if (namespaceValue) {
    namespaceProperty.value = namespaceValue
    return
  }

  sbom.metadata.properties = sbom.metadata.properties.filter(
    (property) => property?.name !== 'cdx:bom:componentNamespaces'
  )
}

const sbom = JSON.parse(fs.readFileSync(targetPath, 'utf8'))
const reachableRefs = runtimeOnly ? buildReachableRefs(sbom) : null
const rootRef = sbom?.metadata?.component?.['bom-ref']

const removedRefs = new Set()
let devScopeAdjusted = 0
let devRemoved = 0
let unreachableRemoved = 0
let riskMetadataStripped = 0

if (Array.isArray(sbom.components)) {
  const normalizedComponents = []

  for (const component of sbom.components) {
    normalizeComponentName(component)

    const componentRef = typeof component['bom-ref'] === 'string' ? component['bom-ref'] : ''

    if (runtimeOnly && componentRef && !reachableRefs.has(componentRef)) {
      removedRefs.add(componentRef)
      unreachableRemoved += 1
      continue
    }

    const isDev = hasDevProperty(component)

    if (isDev) {
      if (omitDev) {
        if (componentRef) {
          removedRefs.add(componentRef)
        }
        devRemoved += 1
        continue
      }

      if (component.scope !== devScope) {
        component.scope = devScope
        devScopeAdjusted += 1
      }
    }

    if (
      stripDependencyRiskMetadata &&
      componentRef &&
      componentRef !== rootRef &&
      stripRiskMetadata(component)
    ) {
      riskMetadataStripped += 1
    }

    normalizedComponents.push(component)
  }

  sbom.components = normalizedComponents
}

if (sbom.metadata?.component) {
  normalizeComponentName(sbom.metadata.component)
}

if (removedRefs.size > 0 && Array.isArray(sbom.dependencies)) {
  sbom.dependencies = sbom.dependencies
    .filter((entry) => !removedRefs.has(entry?.ref))
    .map((entry) => {
      if (Array.isArray(entry?.dependsOn)) {
        entry.dependsOn = entry.dependsOn.filter((depRef) => !removedRefs.has(depRef))
      }
      return entry
    })
} else if (runtimeOnly && Array.isArray(sbom.dependencies)) {
  sbom.dependencies = sbom.dependencies
    .filter((entry) => reachableRefs.has(entry?.ref))
    .map((entry) => {
      if (Array.isArray(entry?.dependsOn)) {
        entry.dependsOn = entry.dependsOn.filter((depRef) => reachableRefs.has(depRef))
      }
      return entry
    })
}

updateMetadataNamespaces(sbom)

fs.writeFileSync(targetPath, `${JSON.stringify(sbom, null, 2)}\n`, 'utf8')

console.log(`Normalized scoped npm component names in ${targetPath}`)
console.log(`Set dev dependency scope to '${devScope}' for ${devScopeAdjusted} component(s)`)
if (runtimeOnly) {
  console.log(`Removed ${unreachableRemoved} non-runtime component(s) from SBOM`)
}
if (omitDev) {
  console.log(`Removed ${devRemoved} development-only component(s) from SBOM`)
}
if (stripDependencyRiskMetadata) {
  console.log(`Stripped install-risk metadata from ${riskMetadataStripped} dependency component(s)`)
}
