/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import type { EpPropMergeType } from 'element-plus/lib/utils/index.js'

export type ElTypeVariant =
  | EpPropMergeType<
      StringConstructor,
      'success' | 'warning' | 'info' | 'primary' | 'danger',
      unknown
    >
  | undefined

export type PSeverity =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warn'
  | 'danger'
  | 'contrast'
