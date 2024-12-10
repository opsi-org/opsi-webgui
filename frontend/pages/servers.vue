<template>
  <LayoutLSplitView
    :is-mobile="isMobile"
    :page0-condition="routeNameSettings?.page0Condition"
    :page1-condition="routeNameSettings?.page1Condition"
    :width="routeNameSettings?.width || width"
    classeachcol=""
    :classfirstcol="'col-main-visible-' + splitviewVisibilityServertable"
  >
    <template #default>
      <el-button
        class="float-right"
        v-if="routeNameSettings?.page1Condition"
        @click="
          splitviewVisibilityServertable = !splitviewVisibilityServertable
        "
        ><IconIIcon
          :icon="
            splitviewVisibilityServertable
              ? icons.toggleVisibilityLeft
              : icons.toggleVisibilityRight
          "
        />
      </el-button>
      <ViewVServer :class="{ hidden: !splitviewVisibilityServertable }" />
    </template>
    <template #page1>
      <NuxtPage />
    </template>
  </LayoutLSplitView>
</template>

<script setup lang="ts">
  import {
    usePageHelper,
    type PageSettings,
  } from '~/composables/mixins/usePageHelper'
  import { useMQ } from '../composables/useMQ'
  import { useIcons } from '~/composables/mixins/useIcons'

  const mq = useMQ()
  const route = useRoute()
  const icons = useIcons()
  const { serverSettings } = usePageHelper()

  const { splitviewVisibilityServertable } = storeToRefs(
    storeInternalSettings(),
  )
  splitviewVisibilityServertable.value = true // default: every time this page is loaded, the servertable is visible

  const routeNameSettings = computed<PageSettings>(() => {
    if (route.name === undefined) {
      throw new Error('route name not found [0]: undefined')
    }
    const key = route.name as string
    if (Object.keys(serverSettings).includes(key)) {
      const s: PageSettings = serverSettings[key]
      if (s === undefined) throw new Error('route name not found [1]: ' + key)
      return s
    }
    throw new Error('route name not found [2]: ' + key)
  })

  const width = computed(() => {
    if (splitviewVisibilityServertable.value) {
      return '50%' // only server and config is visible (each has 50%)
    } else {
      return '90%' // prods (and props) have 90%
    }
  })

  const isMobile = computed(() => {
    return mq.isMobile.value
  })
</script>


