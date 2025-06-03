/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import type { T_Groups, T_GroupsTransformed } from '~/types/APItypes'

export const useGroupsHelper = () => {
  const { multiSelection } = storeToRefs(storeSelections())
  function transformNode(node: T_Groups): T_GroupsTransformed {
    // const nodeIsLeaf = !node.children || Object.keys(node.children).length === 0
    if (!node) {
      console.warn('Node is undefined or null:', node)
      return {} as T_GroupsTransformed
    }
    const nodeIsLeaf = node.type === 'ObjectToGroup'
    const newNode: T_GroupsTransformed = {
      id: node.id,
      type: node.type || 'Group',
      text: node.text,
      parent: node.parent,
    }

    // const newNode: T_Groups = { ...node }
    if (!nodeIsLeaf) {
      newNode.disabled = !multiSelection.value
      if (node.children) {
        newNode.children = Object.values(node.children).map((child) => transformNode(child))
      } else {
        newNode.children = []
      }
    }
    // console.log('node.id', node.id, node, newNode)
    return newNode
  }
  function transformToNestedArray(
    data: T_Groups | Record<string, T_Groups> | undefined,
  ): T_GroupsTransformed[] {
    if (data == undefined) {
      console.warn('Data is undefined or null:', data)
      return []
    }
    return Object.values(data).map((node) => transformNode(node))
  }
  function _getChildrenLabelsLevel(nodeChilds: any, childKey: string="childNodes"): string[] {
    if (!nodeChilds || !Array.isArray(nodeChilds) || nodeChilds.length === 0) {
      console.warn('Node children is undefined or not an array', nodeChilds)
      return []
    }

    console.log('getChildrenLabels', nodeChilds)

    const labels = []
    for (const child of nodeChilds) {
      if (child && child.data && child.data.text) {
        labels.push(child.data.text)
      }
      if (child[childKey] && child[childKey].length > 0) {
        labels.push(..._getChildrenLabelsLevel(child[childKey]))
      }
    }
    return labels
  }
  function getChildrenLabels(node: any): string[] {
    const labels = _getChildrenLabelsLevel(node.childNodes)
    return labels
  }
  function filterNodes(
    nodes: T_GroupsTransformed[],
    searchFor: any[],
    key: string | undefined,
    returnKey: string | undefined
  ): any[] {
    return nodes.reduce((acc: any[], node: any) => {
      if (key && searchFor.includes(node[key])) {
        if (node != undefined) acc.push(returnKey ? node[returnKey] : node)
      }
      if (node.children) {
        const children = filterNodes(node.children, searchFor, key, returnKey)
        if (children) {
          for (const childstr of children) {
            if (childstr == undefined) continue
            acc.push(childstr)
          }
        }
      }
      return acc
    }, [])
  }
  return { transformToNestedArray, filterNodes, getChildrenLabels }
}
