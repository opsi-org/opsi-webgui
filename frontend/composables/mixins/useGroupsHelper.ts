import type { T_Groups, T_GroupsTransformed } from "~/types/APItypes";

export const useGroupsHelper = () => {

  function transformNode(node: T_Groups): T_GroupsTransformed {
    return {
      ...node, // Kopiert alle bekannten und unbekannten Eigenschaften von `node`
      children: node.children
        ? Object.values(node.children).map((child) => transformNode(child))
        : [],
    };
  }
  function transformToNestedArray(data: Record<string, T_Groups>): T_GroupsTransformed[] {
    return Object.values(data).map((node) => transformNode(node));
  }
  return { transformToNestedArray };
}
