import type { T_Groups, T_GroupsTransformed } from '~/types/APItypes'

export const useGroupsHelper = () => {
  function transformNode(node: T_Groups): T_GroupsTransformed {
    return {
      ...node, // Kopiert alle bekannten und unbekannten Eigenschaften von `node`
      children: node.children
        ? Object.values(node.children).map((child) => transformNode(child))
        : [],
    }
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
