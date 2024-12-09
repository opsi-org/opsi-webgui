import type { EpPropMergeType } from 'element-plus/lib/utils/index.js'

// type ElTypeVariant = EpPropMergeType<StringConstructor, "success" | "warning" | "info" | "primary" | "danger", unknown> | undefined
export type ElTypeVariant =
  | EpPropMergeType<
      StringConstructor,
      'success' | 'warning' | 'info' | 'primary' | 'danger',
      unknown
    >
  | undefined

export type PSeverity =
  | 'secondary'
  | 'info'
  | 'success'
  | 'warn'
  | 'danger'
  | 'contrast'
