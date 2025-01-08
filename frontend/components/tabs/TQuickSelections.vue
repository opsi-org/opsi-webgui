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
      <template
        v-if="
          activeName === 'infoselections' && category.name === 'infoselections'
        "
      >
        <FormFAllSelections />
      </template>
      <template
        v-else-if="activeName === 'depots' && category.name === 'depots'"
      >
        <TreeTDepots />
      </template>
      <template v-else-if="activeName === category.name">
        <TreeTGroupSelection :grouptype="category.name" />
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  const icons = useIcons()
  const $t = useI18n().t
  const storeSelection: any = storeSelections()
  const quickSelDisplayList = reactive([
    { name: 'infoselections', store: '' }, // for translation key search: $t('title.infoselections')
    { name: 'depots', store: 'selectionDepots' }, // for translation key search: $t('title.depots')
    { name: 'client-group', store: 'selectionClients' }, // for translation key search: $t('title.client-group')
    { name: 'product-group', store: 'selectionProducts' }, // for translation key search: $t('title.product-group')
  ])
  const activeName = ref<string>('infoselections')
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
