/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'

export const useMQ = () => {
  const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)')
  const _isLargeScreen = useMediaQuery('(min-width: 1000px)')
  const _isMediumScreen = useMediaQuery('(min-width: 767.98px)')
  // on update isMediumScreen Width. also update histoire/histoire-wrapper-mobile.vue .mobile-wrapper class. Make sure that the with of the class is smaller isMediumScreen min-width

  const isMobile = computed(() => {
    return $mq.value === 'mobile' ? true : false
  })
  const $mq = computed({
    get: () => {
      // order importend !
      if (_isLargeScreen.value) {
        return 'desktop'
      }
      if (_isMediumScreen.value) {
        return 'tablet'
      }
      if (!_isMediumScreen.value && !_isLargeScreen.value) {
        return 'mobile'
      }
      return 'nth'
    },
    set: () => {
      console.error('Forbidden to set $mq.')
    },
  })
  return { $mq, isPreferredDark, isMobile }
}
