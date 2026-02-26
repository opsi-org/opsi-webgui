/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

//Iconify Heroicons Outline collection: https://icon-sets.iconify.design/heroicons-outline/
export const icons = {
  // UI Navigation
  menu: 'heroicons:bars-3',
  menuClose: 'heroicons:x-mark',
  sidebarExpand: 'heroicons:chevron-double-right',
  sidebarCollapse: 'heroicons:chevron-double-left',
  quickPanel: 'heroicons:squares-2x2',
  quickPanelAlt: 'heroicons:adjustments-horizontal',

  // Arrows
  arrowDown: 'heroicons:chevron-down',
  arrowLeft: 'heroicons:chevron-left',
  arrowRight: 'heroicons:chevron-right',
  arrowUp: 'heroicons:chevron-up',

  // Actions
  add: 'heroicons:plus',
  close: 'heroicons:x-mark',
  delete: 'heroicons:trash',
  edit: 'heroicons:pencil',
  copy: 'heroicons:clipboard-document',
  clone: 'heroicons:document-duplicate',
  refresh: 'heroicons:arrow-path',
  search: 'heroicons:magnifying-glass',
  filter: 'heroicons:funnel',
  eye: 'heroicons:eye',

  // Content types
  client: 'heroicons:computer-desktop',
  serverStack: 'heroicons:server-stack',
  server: 'heroicons:server',
  product: 'heroicons:cube',
  group: 'heroicons:rectangle-group',
  admin: 'heroicons:cog-6-tooth',
  terminal: 'heroicons:command-line',
  support: 'heroicons:lifebuoy',

  // Status & Info
  config: 'heroicons:cog-8-tooth',
  settings: 'heroicons:adjustments-vertical',
  log: 'heroicons:document-text',
  warning: 'heroicons:exclamation-triangle',
  check: 'heroicons:check-circle',
  error: 'heroicons:x-circle',
  info: 'heroicons:information-circle',
  health: 'heroicons:heart',
  list: 'heroicons:list-bullet',
  table: 'heroicons:table-cells',

  // User & Auth
  user: 'heroicons:user',
  users: 'heroicons:user-group',
  key: 'heroicons:key',
  logout: 'heroicons:arrow-right-on-rectangle',

  // Theme & Language
  language: 'heroicons:language',
  themeLight: 'heroicons:sun',
  themeDark: 'heroicons:moon',

  // Misc
  loading: 'heroicons:arrow-path',
  modules: 'heroicons:puzzle-piece',
  maintenance: 'heroicons:wrench-screwdriver',
  diagnostics: 'heroicons:chart-bar',
} as const

export type IconName = keyof typeof icons
export const useIcons = () => icons
