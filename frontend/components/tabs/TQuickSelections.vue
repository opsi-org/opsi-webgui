<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-tabs class="quickselection z-0" v-model="activeName">
    <el-tab-pane
      v-for="category in quickSelDisplayList"
      :key="category.name"
      :name="category.name"
      :data-testid="`tab-${category.name}-content`"
    >
      <template #label>
        <IconIIcon
          v-for="icon in category.name.split('-')"
          :key="icon"
          :icon="getIcon(icon)"
          :title="$t(category.name)"
        />
        <el-text size="small" class="mt-2" v-if="category.store != ''">
          {{ storeSelection[category.store].length }}
        </el-text>
      </template>
      <template v-if="activeName === 'infoselections' && category.name === 'infoselections'">
        <FormFAllSelections />
      </template>
      <template v-else-if="activeName === 'depots' && category.name === 'depots'">
        <TreeTDepots />
      </template>
      <template v-else-if="activeName === category.name">
        <TreeTGroupSelection :grouptype="category.name" />
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  import type { PropTypeGroupTree } from '~/types/tproptypes'
  const icons = useIcons()
  const $t = useI18n().t
  const storeSelection: any = storeSelections()
  const quickSelDisplayList = reactive([
    { name: 'infoselections' as PropTypeGroupTree, store: '' },
    { name: 'depots' as PropTypeGroupTree, store: 'selectionDepots' },
    { name: 'client-group' as PropTypeGroupTree, store: 'selectionClients' },
    { name: 'product-group' as PropTypeGroupTree, store: 'selectionProducts' },
  ])
  const activeName = ref<PropTypeGroupTree>('infoselections')
  function getIcon(icon: string) {
    if (Object.keys(icons).includes(icon)) return (icons as any)[icon]
    throw new Error(`Icon ${icon} not found`)
  }
</script>

<style>
  .quickselection .el-tabs__content {
    height: 50vh !important;
    overflow-y: auto;
  }
</style>
