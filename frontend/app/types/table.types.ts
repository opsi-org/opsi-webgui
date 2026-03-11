/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
*/

export interface TableColumn<T = unknown> {
  key: string
  label: string
  sortable?: boolean
  visible?: boolean
  alwaysVisible?: boolean
  class?: string
  headerClass?: string
  width?: string
  minWidth?: string
  align?: 'left' | 'center' | 'right'
  icon?: string
  formatter?: (value: unknown, row: T) => string | number
}

export interface TableSortState {
  column: string
  direction: 'asc' | 'desc'
}

export interface TablePaginationState {
  page: number
  pageSize: number
  total: number
}

export interface TableFetchParams {
  page: number
  pageSize: number
  sortBy?: string
  sortDesc?: boolean
  filterQuery?: string
  [key: string]: unknown
}

export interface TableFetchResult<T> {
  data: T[]
  total: number
}

export interface TableAction<T = unknown> {
  icon: string
  label?: string
  color?: string
  handler: (row: T) => void
  visible?: (row: T) => boolean
}

export type RowClickHandler<T> = (row: T) => void
