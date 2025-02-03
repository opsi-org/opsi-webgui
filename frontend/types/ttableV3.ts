/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
// import type { IObjectString2ObjectString2String, IObjectString2String, IObjectString2StringOrUndefined } from './tgeneral'

import type { CheckboxValueType, Column } from 'element-plus'

// export type ITableHeaderCell = {
//   label: string,
//   key: string,
//   visible: boolean,
//   sortable?: boolean,
//   _fixed?: boolean,
//   _isMajor?: boolean,
//   disabled?: boolean,
//   _majorKey?: string,
//   class?: string,
//   variant?: string,
//   stickyColumn?: boolean
//   mergeOnMobile?: boolean
// }
export type ITableHeaderCell = Column<any>

export interface ITableHeaderRow {
  [key: string]: ITableHeaderCell
}

export type ISelectionCellProps = {
  value: boolean
  intermediate?: boolean
  onChange: (value: CheckboxValueType) => void
  show?: boolean
}
// export interface ITableHeader {
//   label: string,
//   key: string,
//   visible: boolean,
//   sortable?: boolean,
//   _fixed?: boolean,
//   _isMajor?: boolean,
//   disabled?: boolean,
//   _majorKey?: string,
//   class?: string,
//   variant?: string,
//   stickyColumn?: boolean
//   mergeOnMobile?: boolean
// }
// export interface ITableHeaders {
//   [key: string]: ITableHeader
// }

// export interface ITableHeader {
//   [key: string]: Column<any>
// }
