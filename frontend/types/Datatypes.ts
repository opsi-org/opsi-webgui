import type { T_Client, T_Server } from './APItypes'

export type TRowData = T_Server | T_Client | any

export interface TTimeDiff {
  diff: number
  days: number
  hours: number
  minutes: number
  seconds: number
}
