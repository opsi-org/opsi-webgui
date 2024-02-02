<template>
  <el-tabs class="quickselection" v-model="activeName">
    <el-tab-pane v-for="category in quickSelDisplayList" :key="category.name" :name="category.name">
      <template #label>
        <IconIIcon v-for="icon in (category.name).split('-')" :icon="icons[icon]" :title="$t('title.'+category.name)" />
        <el-text size="small" class="mt-2" v-if="category.store!= ''"> {{storeSelection[category.store].length}} </el-text>
      </template>
      <template v-if="category.name == 'infoselections'"> <FormFAllSelections /> </template>
      <template v-else-if="category.name == 'depots'"> <TreeTDepots /> </template>
      <template v-else-if="category.name == 'client-group'"> <TreeTHostGroups /> </template>
      <template v-else-if="category.name == 'product-group'"> <TreeTProductGroups /> </template>
      <template v-else> -- </template>
    </el-tab-pane>
  </el-tabs>
        <!--
        <TreeTSHostGroups :open="true" :multi="multiSelection" type="propertyvalues" classes="treeselect_quickpanel" />
        <TreeTSProductGroups :open="true" type="propertyvalues" :multi="multiSelection" classes="treeselect_quickpanel" />
        -->
</template>

<script setup lang="ts">
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const storeSelection = storeSelections()
const quickSelDisplayList = reactive([
    {name: 'infoselections', store: ''},
    {name: 'depots', store: 'selectionDepots'},
    {name: 'client-group', store: 'selectionClients'},
    {name: 'product-group', store: 'selectionProducts'}
])
const activeName = ref('infoselections')
</script>

<style>
.quickselection .el-tabs__content{
  min-height: 30vh !important;
  overflow-y: auto;
}
</style>
