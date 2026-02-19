/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useUiHelpers() {
  // Media queries
  const isDark = useMediaQuery('(prefers-color-scheme: dark)')
  const isDesktop = useMediaQuery('(min-width: 1000px)')
  const isTablet = useMediaQuery('(min-width: 767.98px)')
  const mq = computed(() => (isDesktop.value ? 'desktop' : isTablet.value ? 'tablet' : 'mobile'))
  const isMobile = computed(() => mq.value === 'mobile')

  // i18n translation function
  let translate = (key: string) => key
  try {
    const { t } = useI18n({ useScope: 'global' })
    if (t) translate = t
  } catch {
    // fallback: return key as-is
  }

  return { mq, isDark, isMobile, translate }
}
