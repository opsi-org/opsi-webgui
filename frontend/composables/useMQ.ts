import { useColorMode, useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'

export const useMQ = () => {
  const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)')
  const _isLargeScreen = useMediaQuery('(min-width: 1024px)')
  const _isMediumScreen = useMediaQuery('(min-width: 768px)')

  const color = useColorMode()
  color.value = isPreferredDark ? 'dark' : 'light'

  const $mq = computed({
    get: () => {
      // order importend !
      if (_isLargeScreen.value) { return 'desktop'}
      if (_isMediumScreen.value) { return 'tablet'}
      if (!_isMediumScreen.value && !_isLargeScreen.value) { return 'mobile'}
      return 'nth'
    },
    set: (x) => { console.error('Forbidden to set $mq.') }
  });
  return { $mq, isPreferredDark }
 }