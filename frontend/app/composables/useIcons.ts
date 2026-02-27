/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

// Nuxt UI icons use the i-{collection}-{name} format
// https://ui.nuxt.com/components/icon
// Using Heroicons: https://icon-sets.iconify.design/heroicons/
export const icons = {
  // UI Navigation
  menu: 'i-heroicons-bars-3',
  menuClose: 'i-heroicons-x-mark',
  quickPanel: 'i-heroicons-squares-2x2',
  home: 'i-heroicons-home',
  back: 'i-heroicons-arrow-left',
  forward: 'i-heroicons-arrow-right',

  // Arrows
  arrowDown: 'i-heroicons-chevron-down',
  arrowLeft: 'i-heroicons-chevron-left',
  arrowRight: 'i-heroicons-chevron-right',
  arrowUp: 'i-heroicons-chevron-up',
  expand: 'i-heroicons-chevron-down',
  collapse: 'i-heroicons-chevron-up',

  // Actions
  add: 'i-heroicons-plus',
  close: 'i-heroicons-x-mark',
  delete: 'i-heroicons-trash',
  edit: 'i-heroicons-pencil',
  copy: 'i-heroicons-clipboard-document',
  clone: 'i-heroicons-document-duplicate',
  refresh: 'i-heroicons-arrow-path',
  upload: 'i-heroicons-arrow-up-tray',
  download: 'i-heroicons-arrow-down-tray',
  search: 'i-heroicons-magnifying-glass',
  filter: 'i-heroicons-funnel',
  eye: 'i-heroicons-eye',
  eyeOff: 'i-heroicons-eye-slash',
  clear: 'i-heroicons-x-circle',
  save: 'i-heroicons-check',
  cancel: 'i-heroicons-x-mark',

  // Table
  columns: 'i-heroicons-view-columns',
  sort: 'i-heroicons-arrows-up-down',
  sortAsc: 'i-heroicons-bars-arrow-up',
  sortDesc: 'i-heroicons-bars-arrow-down',

  // Content types
  client: 'i-heroicons-computer-desktop',
  server: 'i-heroicons-server',
  serverStack: 'i-heroicons-server-stack',
  product: 'i-heroicons-cube',
  group: 'i-heroicons-rectangle-group',
  admin: 'i-heroicons-wrench-screwdriver',
  terminal: 'i-heroicons-command-line',
  support: 'i-heroicons-lifebuoy',
  modules: 'i-heroicons-puzzle-piece',
  diagnostics: 'i-heroicons-chart-bar',
  log: 'i-heroicons-document-text',
  config: 'i-heroicons-cog-8-tooth',
  maintenance: 'i-heroicons-wrench',
  backup: 'i-heroicons-archive-box',
  restore: 'i-heroicons-arrow-path-rounded-square',
  document: 'i-heroicons-document',
  folder: 'i-heroicons-folder',

  // Status & Info
  settings: 'i-heroicons-adjustments-vertical',
  warning: 'i-heroicons-exclamation-triangle',
  check: 'i-heroicons-check-circle',
  error: 'i-heroicons-x-circle',
  info: 'i-heroicons-information-circle',
  health: 'i-heroicons-heart',
  list: 'i-heroicons-list-bullet',
  table: 'i-heroicons-table-cells',
  loading: 'i-heroicons-arrow-path',
  success: 'i-heroicons-check-circle',
  blocked: 'i-heroicons-no-symbol',
  locked: 'i-heroicons-lock-closed',
  unlocked: 'i-heroicons-lock-open',

  // User & Auth
  user: 'i-heroicons-user',
  users: 'i-heroicons-user-group',
  key: 'i-heroicons-key',
  logout: 'i-heroicons-power',
  shield: 'i-heroicons-shield-check',

  // Theme & Language
  language: 'i-heroicons-globe-alt',
  themeLight: 'i-heroicons-sun',
  themeDark: 'i-heroicons-moon',
  globe: 'i-heroicons-globe-alt',

  // Time
  clock: 'i-heroicons-clock',
  calendar: 'i-heroicons-calendar',

  // External
  externalLink: 'i-heroicons-arrow-top-right-on-square',
  link: 'i-heroicons-link',
  github: 'i-simple-icons-github',
  forum: 'i-heroicons-chat-bubble-left-right',

} as const

export type IconName = keyof typeof icons
export const useIcons = () => icons
