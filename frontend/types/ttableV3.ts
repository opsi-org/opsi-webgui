// import type { IObjectString2ObjectString2String, IObjectString2String, IObjectString2StringOrUndefined } from './tgeneral'

import type { Column } from 'element-plus'

export type ITableHeaderCell = Column<any>

export interface ITableHeaderRow {
  [key: string]: ITableHeaderCell
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