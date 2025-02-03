<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <el-text tag="b" class="text-capitalize after:content-['-']">
      {{ pagetype }}</el-text
    >
    <el-text tag="i"> {{ id }} </el-text>
    <el-button
      class="float-right"
      @click="
        () => {
          splitviewVisibilityServertable = true
          router.push(`/${type}/`)
        }
      "
      ><IconIIcon :icon="icons.x"
    /></el-button>
    <ViewVHostConfig
      v-if="pagetype === 'config'"
      :type="type"
      :id="id"
      :is-child="id !== undefined && id !== ''"
    />
    <div v-else>{{ $t('message.error.404') }}</div>
  </div>
</template>

<script setup lang="ts">
  import { usePageHelper } from '~/composables/mixins/usePageHelper'
  import type { PropTypeServerClient } from '~/types/tproptypes'
  const route = useRoute()
  const router = useRouter()
  const icons = useIcons()
  const { splitviewVisibilityServertable } = storeToRefs(
    storeInternalSettings(),
  )
  const type = computed<PropTypeServerClient>(
    () => usePageHelper().path.value[0] as PropTypeServerClient,
  )
  const id = computed<string>(() => route.params.id as string)
  const pagetype = computed<string>(() => route.params.pagetype as string)
</script>
