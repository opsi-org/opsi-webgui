<template>
  <el-tabs class="quickselection" v-model="activeName">
    <el-tab-pane
      v-for="category in quickSelDisplayList"
      :key="category.name"
      :name="category.name"
    >
      <template #label>
        <IconIIcon
          v-for="icon in category.name.split('-')"
          :key="icon"
          :icon="getIcon(icon)"
          :title="$t('title.' + category.name)"
        />
        <el-text size="small" class="mt-2" v-if="category.store != ''">
          {{ storeSelection[category.store].length }}
        </el-text>
      </template>
      <template v-if="category.name == 'infoselections'">
        <FormFAllSelections />
      </template>
      <template v-else-if="category.name == 'depots'">
        <TreeTDepots />
      </template>
      <template v-else>
        <TreeTGroupSelection :grouptype="category.name" />
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  import { useIcons } from '../../composables/mixins/useIcons'
  const icons = useIcons()
  const $t = useI18n().t
  const storeSelection: any = storeSelections()
  const quickSelDisplayList = reactive([
    { name: 'infoselections', store: '' },
    { name: 'depots', store: 'selectionDepots' },
    { name: 'client-group', store: 'selectionClients' },
    { name: 'product-group', store: 'selectionProducts' },
  ])
  const activeName = ref<string>('infoselections')
  function getIcon(icon: string) {
    if (Object.keys(icons).includes(icon)) return (icons as any)[icon]
    throw new Error(`Icon ${icon} not found`)
  }
</script>

<style>
  .quickselection .el-tabs__content {
    min-height: 30vh !important;
    max-height: 50vh !important;
    overflow-y: auto;
  }
</style>
