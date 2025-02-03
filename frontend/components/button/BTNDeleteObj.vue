<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-button
    data-testid="ButtonBTNDeleteObj"
    class="border-0"
    variant="outline-primary"
    size="small"
    :title="$t('button.reset')"
    @click="deleteChanges()"
  >
    <span class="sr-only">{{ $t('button.reset') }}</span>
    <IconIIcon :icon="icons.reset" />
  </el-button>
</template>

<script lang="ts" setup>
  const $t = useI18n().t
  const icons = useIcons()
  const changes = storeChanges()

  const props = defineProps({
    item: { type: Object, required: true },
    from: { type: String, required: true },
  })

  function deleteChanges() {
    if (!props.item) return

    if (props.from === 'products') {
      changes.delFromChangesProducts(props.item)
    }
    if (props.from === 'hostparam') {
      changes.delFromChangesHostParam(props.item)
    }
  }
</script>
