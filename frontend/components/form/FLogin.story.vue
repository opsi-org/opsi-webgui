
<script lang="ts" async setup>
// import {useConfigserver} from '@/composables/mixins/useGet'
// const useConfigserverMixin = useConfigserver()
// console.log('Story. fetch', await useConfigserverMixin.getOpsiConfigServer())
// const settingsStore = storeSettings()
// console.log('Story. store', settingsStore)
// console.log('Story. store', settingsStore.twoColumnLayoutCollapsed)

import { useConfigserver } from '../../composables/mixins/useGet';
import { storeCache } from '../../store/datacacheStore';


// async function setupApp() {
//   const cacheStore = storeCache()
//   const api = useConfigserver()
//   const ocs = await api.getOpsiConfigServer()
//   // console.log('Story. mixin api', api)
//   // console.log('Story. mixin api', ocs)
//   cacheStore.setOpsiconfigserver(ocs)
// }
</script>

<template>
  <!-- :setup-app="setupApp" -->
  <Story
  >
    <FormFLogin/>
  </Story>
</template>
