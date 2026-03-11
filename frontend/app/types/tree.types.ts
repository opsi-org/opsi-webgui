/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Tree component types.
*/

export interface TreeNode {
  id: string
  label: string
  parentId?: string | null
  icon?: string
  children?: TreeNode[]
  value?: unknown
  valueType?: 'string' | 'number' | 'boolean' | 'array' | 'object'
  options?: (string | number)[]
  description?: string
  readonly?: boolean
  modified?: boolean
  type?: string
  data?: Record<string, unknown>
  actions?: TreeNodeAction[]
}

export interface TreeNodeAction {
  icon: string
  label: string
  color?: string
  handler?: (node: TreeNode) => void
}

export interface TreeChangeBuffer {
  nodeId: string
  originalValue: unknown
  newValue: unknown
  timestamp: number
}
