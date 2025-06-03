<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <LayoutLSplitView
    :is-mobile="isMobile"
    :page0-condition="routeNameSettings?.page0Condition"
    :page1-condition="routeNameSettings?.page1Condition"
    :width="routeNameSettings?.width || width"
    classeachcol=""
    :classfirstcol="'col-main-visible-' + splitviewVisibilityClienttable"
  >
    <template #default>
      <el-tooltip :content="$t('button.showhide.clienttable')" placement="top">
        <el-button
          class="float-right"
          v-if="routeName.startsWith('clients-products') && routeNameSettings?.page1Condition"
          @click="toggleClientstableVisibility"
        >
          <IconIIcon
            :icon="
              splitviewVisibilityClienttable
                ? icons.toggleVisibilityLeft
                : icons.toggleVisibilityRight
            "
          />
        </el-button>
      </el-tooltip>
      <!-- using if-statement (v-if=splitviewVisibilityClienttable) would rerender clients again.. class simply toggle visibility of html part -->
      <ViewVClients
        :class="{ hidden: !splitviewVisibilityClienttable }"
        :is-mobile="mq.isMobile.value"
      />
    </template>
    <template #page1>
      <NuxtPage />
    </template>
  </LayoutLSplitView>
</template>

<script setup lang="ts">
  import { usePageHelper } from '~/composables/mixins/usePageHelper'
  import { useMQ } from '../composables/useMQ'

  const icons = useIcons()
  const mq = useMQ()
  const route = useRoute()
  const { path, clientSettings } = usePageHelper()

  const { splitviewVisibilityClienttable } = storeToRefs(storeInternalSettings())
  splitviewVisibilityClienttable.value = true // default: every time this page is loaded, the clienttable is visible

  const routeName = computed(() => (route.name as string) || '')
  const routeNameSettings = computed(() => {
    const s = clientSettings[routeName.value]
    if (s === undefined) throw new Error('route name not found: ' + (route.name as string))
    return s
  })

  const width = computed(() => {
    if (splitviewVisibilityClienttable.value) {
      if (path.value.length === 3) return '50%' // only clients and products are visible (products have 50%)
      return '66%' // properties are open. prods and props have together 66%
    } else {
      return '90%' // prods (and props) have 90%
    }
  })

  const isMobile = computed(() => {
    return mq.isMobile.value
  })

  function toggleClientstableVisibility() {
    splitviewVisibilityClienttable.value = !splitviewVisibilityClienttable.value
  }
</script>
