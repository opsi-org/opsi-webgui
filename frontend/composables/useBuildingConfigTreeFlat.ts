/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import type { T_HostParameter, T_HostParameterEntry } from '~/types/APItypes'

export const useBuildingConfigTreeFlat = () => {
  type TreeNode = {
    children: Map<string, TreeNode>
    entries: T_HostParameterEntry[]
  }

  function buildTree(
    input: T_HostParameter,
    maxDepth: number = Infinity,
  ): { root: TreeNode; general: T_HostParameterEntry[] } {
    const root: TreeNode = { children: new Map(), entries: [] }
    const general: T_HostParameterEntry[] = input['general'] || []

    for (const key in input) {
      if (key === 'general') continue
      for (const entry of input[key]) {
        const parts = entry.configId.split('.').slice(0, maxDepth)
        let node = root

        for (const part of parts) {
          if (!node.children.has(part)) {
            node.children.set(part, { children: new Map(), entries: [] })
          }
          node = node.children.get(part)!
        }
        node.entries.push(entry)
      }
    }
    return { root, general }
  }

  function extractGroups(
    node: TreeNode,
    prefix: string = '',
    minEntries: number = 2,
    output: T_HostParameter = {},
    parentEntries: T_HostParameterEntry[] = [],
  ): void {
    const currentEntries = [...node.entries]

    for (const [key, child] of node.children) {
      // const newPrefix = ''
      const newPrefix = prefix ? `${prefix}.${key}` : key
      // const newPrefix = prefix ? `${prefix}` : key
      // const newPrefix = prefix ? `${key}` : key NO
      extractGroups(child, newPrefix, minEntries, output, currentEntries)
    }

    if (currentEntries.length >= minEntries || prefix.split('.').length === 1) {
      // get possiblePrefixes from currentEntries and check if all entries have the same prefix
      const possiblePrefixes0 =
        currentEntries.length > 0 ? currentEntries[0].configId.split('.') : []
      let lastWorkedPrefix = ''

      for (let i = 0; i < possiblePrefixes0.length; i++) {
        // testPrefix is this item + all previous
        const testPrefix = possiblePrefixes0.slice(0, i + 1).join('.')
        if (
          currentEntries.every((entry) => entry.configId.startsWith(testPrefix))
        ) {
          lastWorkedPrefix = testPrefix
        } else {
          break
        }
      }
      const currentPrefix = lastWorkedPrefix
      output[currentPrefix] = currentEntries.sort((a, b) =>
        a.configId.localeCompare(b.configId),
      )
    } else {
      if (currentEntries.length > 0)
        parentEntries.push(
          ...currentEntries.sort((a, b) =>
            a.configId.localeCompare(b.configId),
          ),
        )
    }
  }

  function restructureData(
    input: T_HostParameter,
    minEntries: number = 3,
    maxDepth: number = 2, // 2 is the default, so user.{adminuser}. is grouped and not splitted
  ): T_HostParameter {
    const { root, general } = buildTree(input, maxDepth)
    const output: T_HostParameter = {}
    extractGroups(root, '', minEntries, output)
    if (general.length > 0) {
      output['general'] = general
    }
    if (output[''].length <= 0) {
      delete output['']
    }

    const entries = Object.entries(output)
    entries.sort((a, b) =>
      a[0] == 'general' || b[0] == 'general' ? -1 : a[0].localeCompare(b[0]),
    )
    const sortedoutput = Object.fromEntries(entries)
    return sortedoutput
  }

  return { restructureData }
}
