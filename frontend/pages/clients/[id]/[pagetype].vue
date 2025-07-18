<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <el-text tag="b" class="text-capitalize after:content-['-']"> {{ pagetype }}</el-text>
    <el-text tag="i"> {{ id }} </el-text>
    <el-button class="float-right" @click="router.push('/clients/')">
      <IconIIcon :icon="icons.x" />
    </el-button>
    <ViewVConfigHost
      v-if="pagetype === 'config'"
      :type="type"
      :id="id"
      :is-child="id !== undefined && id !== ''"
    />
    <ViewVClientsLog
      v-else-if="pagetype === 'logs'"
      :type="type"
      :id="id"
      :is-child="id !== undefined && id !== ''"
    />
    <FormFCloneClient
      v-else-if="pagetype === 'clone'"
      :id="id"
      :is-child="id !== undefined && id !== ''"
    />
    <div v-else>{{ $t('message.pageNotFound') }}</div>
  </div>
</template>

<script setup lang="ts">
  import { usePageHelper } from '~/composables/mixins/usePageHelper'
  import type { PropTypeServerClient } from '~/types/tproptypes'

  const route = useRoute()
  const router = useRouter()
  const icons = useIcons()
  const type = computed(() => usePageHelper().path.value[0] as PropTypeServerClient)
  const id = computed(() => route.params.id as string)
  const pagetype = computed(() => route.params.pagetype as string)
</script>
