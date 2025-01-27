import type { T_Groups, T_GroupsTransformed } from '~/types/APItypes'

export const useGroupsHelper = () => {
  function transformNode(node: T_Groups): T_GroupsTransformed {
    const nodeIsLeaf = !node.children || Object.keys(node.children).length === 0
    const newNode: T_GroupsTransformed = {
      id: node.id,
      type: node.type,
      text: node.text,
      parent: node.parent,
    }

    // const newNode: T_Groups = { ...node }
    if (!nodeIsLeaf) {
      if (node.children) {
        newNode.children = Object.values(node.children).map((child) =>
          transformNode(child),
        )
      } else {
        newNode.children = []
      }
    }
    // console.log('node.id', node.id, node, newNode)
    return newNode
  }
  function transformToNestedArray(
    data: Record<string, T_Groups>,
  ): T_GroupsTransformed[] {
    return Object.values(data).map((node) => transformNode(node))
  }

  function filterNodes(
    nodes: T_GroupsTransformed[],
    searchFor: any[],
    key: string | undefined,
    returnKey: string | undefined,
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
  return { transformToNestedArray, filterNodes }
}
