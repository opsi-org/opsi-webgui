/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import type { T_HostParameter, T_HostParameterEntry } from '~/types/APItypes'
import type { TreeNode } from 'primevue/treenode'

export const useBuildingConfigTree = () => {
  function buildTree(
    data: T_HostParameter,
    maxDepth: number = 2,
    minEntries: number = 2,
  ) {
    const tree: TreeNode[] = []

    // Hilfsfunktion: Gehe durch die Baumknoten (bzw. lege sie an), basierend auf den übergebenen Segmenten.
    function traverseAndCreate(
      nodes: TreeNode[],
      segments: string[],
    ): TreeNode {
      const currentPath: string[] = []
      let currentNodes = nodes
      let node: TreeNode | undefined

      for (const seg of segments) {
        currentPath.push(seg)
        const key = currentPath.join('.')
        node = currentNodes.find((n) => n.key === key)
        if (!node) {
          node = { key, label: seg, children: [] }
          currentNodes.push(node)
          // Alphabetisch sortieren
          currentNodes.sort((a: any, b: any) => a.label.localeCompare(b.label))
        }
        if (node.children === undefined) node.children = []
        currentNodes = node.children
      }
      return node as TreeNode
    }

    // Verarbeitung jedes Eintrags
    for (const synonym in data) {
      data[synonym].forEach((entry: T_HostParameterEntry) => {
        const segments = entry.configId.split('.')
        if (segments.length <= maxDepth) {
          // Der Eintrag passt genau in die Hierarchie (oder ist kürzer als maxDepth).
          const node = traverseAndCreate(tree, segments)
          // Falls der Knoten noch kein direktes Entry (Leaf) repräsentiert, speichern wir es direkt im Knoten.
          // Falls bereits ein Eintrag vorhanden ist, legen wir einen separaten Leaf unterhalb des Knotens an.
          if (!node.data) {
            node.data = entry
          } else {
            if (!node.children) node.children = []
            node.children.push({
              key: entry.configId,
              label: segments[segments.length - 1],
              data: entry,
            })
            node.children.sort((a: any, b: any) =>
              a.label.localeCompare(b.label),
            )
          }
        } else {
          // Der Eintrag geht über die erlaubte Tiefe hinaus:
          // Die ersten maxDepth Segmente definieren den Gruppen-Knoten
          const branchSegments = segments.slice(0, maxDepth)
          // Der Rest (könnte mehrere Segmente enthalten) wird als Label für den Leaf verwendet
          const remainder = segments.slice(maxDepth)
          const branchNode = traverseAndCreate(tree, branchSegments)
          if (!branchNode.children) branchNode.children = []
          branchNode.children.push({
            key: entry.configId,
            label: remainder.join('.'),
            data: entry,
          })
          branchNode.children.sort((a: any, b: any) =>
            a.label.localeCompare(b.label),
          )
        }
      })
    }

    // Prune-Funktion: Wenn ein Knoten (mit Kindern) weniger als minEntries Leafs enthält,
    // werden diese Kinder an den Parent "hochgestuft" und der Knoten entfernt.
    function prune(nodes: TreeNode[], parent: TreeNode | null) {
      // Iteriere rückwärts, damit das Entfernen funktioniert
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i]
        if (node.children && node.children.length > 0) {
          prune(node.children, node)
          // Wende die minEntries-Regel nur an, wenn der Knoten _wirklich_ Gruppenkinder hat.
          if (node.children.length < minEntries) {
            if (parent) {
              // Falls der Knoten selbst ein direktes Entry besitzt, sichern wir es als Leaf in den Parent:
              if (node.data) {
                if (!parent.children) parent.children = []
                parent.children.push({
                  key: node.key,
                  label: node.label,
                  data: node.data,
                })
              }
              // Für jedes Kind: Label anpassen, sodass es den entfernten Knoten-Key als Präfix erhält.
              node.children.forEach((child) => {
                child.label = node.label + '.' + child.label
                if (!parent.children) parent.children = []
                parent.children.push(child)
              })
              // Entferne den aktuellen Knoten:
              nodes.splice(i, 1)
            }
            // Falls kein Parent vorhanden ist (Wurzelknoten), können wir den Knoten nicht hochstufen.
          }
        }
      }
      // Nach jedem Lift sortieren wir die Liste alphabetisch.
      nodes.sort((a: any, b: any) => a.label.localeCompare(b.label))
    }

    prune(tree, null)

    // Neue Funktion: Falls ein Gruppen-Knoten ausschließlich ein einziges Gruppen-Kind hat,
    // wird dieser zusammengeführt, sodass sich z.B. 'group1' > 'subgroup1' in 'group1.subgroup1'
    // verwandelt.
    function mergeSingleChildGroups(nodes: TreeNode[]) {
      nodes.forEach((node) => {
        // Prüfen: Wenn der aktuelle Knoten ein reiner Gruppen-Knoten ist (kein direktes Entry)
        // und genau ein Kind hat, das ebenfalls ein Gruppen-Knoten ist (mit eigenen Kindern),
        // dann mergen.
        while (
          node.children &&
          node.children.length === 1 &&
          !node.data &&
          node.children[0].children &&
          node.children[0].children.length > 0 &&
          // Optional: Falls auch das Kind kein direktes Entry hat.
          !node.children[0].data
        ) {
          const child = node.children[0]
          node.key = node.key + '.' + child.label
          node.label = node.label + '.' + child.label
          // Die Kinder des Childs werden nun direkt unter dem (gemergten) Elternknoten geführt.
          node.children = child.children
        }
        // Rekursiv in die Kinder gehen.
        if (node.children) {
          mergeSingleChildGroups(node.children)
        }
      })
    }

    mergeSingleChildGroups(tree)
    return tree
  }

  function restructureData(
    input: T_HostParameter,
    maxDepth: number = 4,
    minGroupSize: number = 3,
  ): TreeNode[] {
    const data = buildTree(input, maxDepth, minGroupSize)
    return data
  }

  return { restructureData }
}
