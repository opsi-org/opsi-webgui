/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Group-related types.
*/

/* Group tree node data structure for both client groups and product groups */
export interface GroupTreeNodeData {
  id: string
  label: string
  parentId?: string | null
  description?: string
  notes?: string
  type?: 'HostGroup' | 'ProductGroup' | 'ObjectToGroup'
  children?: GroupTreeNodeData[]
  memberCount?: number
  members?: string[]
  isRoot?: boolean
  isSpecial?: boolean // e.g., not_assigned group
  hasSelection?: boolean
}

/* Available actions for group nodes */
export type GroupAction =
  | 'addSubgroup'
  | 'edit'
  | 'delete'
  | 'manageMembers'
  | 'removeAllMembers'
  | 'copy'

/* Form data for creating/editing a group */
export interface GroupFormData {
  groupId: string
  description: string
  notes: string
  parentGroupId: string
}
