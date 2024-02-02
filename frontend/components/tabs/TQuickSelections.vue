<template>
  <el-tabs v-model="activeName" class="quickselection">
    <el-tab-pane name="sel">
      <template #label>
        <IconIIcon :icon="icons.info" :title="$t('title.viewselection')" />
      </template>
      <FormFAllSelections />
    </el-tab-pane>
    <el-tab-pane name="server">
      <template #label>
        <IconIIcon :icon="icons.server" :title="$t('title.depots')" />
        <el-text size="small">{{ selections.selectionDepots.length }}</el-text>
      </template>
      <TreeTDepots />
    </el-tab-pane>
    <el-tab-pane name="client">
      <template #label>
        <IconIIcon :icon="icons.client" :title="$t('treeselect.clientGroups')" /><IconIIcon :icon="icons.group" class="mt-2" />
        <el-text size="small">{{ selections.selectionClients.length }}</el-text>
      </template>
      <TestEPTreeSelect />
      <TreeTHostGroups />
    </el-tab-pane>
    <el-tab-pane name="prod">
      <template #label>
        <IconIIcon :icon="icons.product" :title="$t('treeselect.prodGroups')" /><IconIIcon :icon="icons.group" class="mt-2" />
        <el-text size="small">{{ selections.selectionProducts.length }}</el-text>
      </template>
      <TreeTProductGroups />
    </el-tab-pane>
  </el-tabs>

  <!-- <b-tabs justified small lazy data-testid="TQuickSelections" class="QPTabs">
    <b-tab id="qp-tab-depots">
      <template #title>
        <IconIIcon :icon="icon.server" :title="$t('title.depots')" /> {{ selectionDepots.length }}
      </template>
      <div class="scrollcontent">
        <TreeTSDepots :open="true" type="propertyvalues" :multi="multiSelection" classes="treeselect_quickpanel" />
      </div>
    </b-tab>
    <b-tab id="qp-tab-clients">
      <template #title>
        <IconIIcon :icon="icon.client" :title="$t('treeselect.clientGroups')" /><IconIIcon :icon="icon.group" font-scale="0.7" /> {{ selectionClients.length }}
      </template>
      <div class="scrollcontent">
        <TreeTSHostGroups :open="true" :multi="multiSelection" type="propertyvalues" classes="treeselect_quickpanel" />
      </div>
    </b-tab>
    <b-tab id="qp-tab-products">
      <template #title>
        <IconIIcon :icon="icon.product" :title="$t('treeselect.prodGroups')" /><IconIIcon :icon="icon.group" font-scale="0.7" /> {{ selectionProducts.length }}
      </template>
      <div class="scrollcontent">
        <TreeTSProductGroups :open="true" type="propertyvalues" :multi="multiSelection" classes="treeselect_quickpanel" />
      </div>
    </b-tab>
  </b-tabs> -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const activeName = ref('sel')
const selections = storeSelections()
// import { Component, namespace, Vue } from 'nuxt-property-decorator'
// import { Icons } from '../../mixins/icons'
// import { Strings } from '../../mixins/strings'
// const selections = namespace('selections')

// @Component({ mixins: [Icons, Strings] })
// export default class TQuickSelections extends Vue {
//   icon:any
//   t_fixed:any
//   $mq:any
//   @selections.Getter public multiSelection!: Array<string>
//   @selections.Getter public selectionDepots!: Array<string>
//   @selections.Getter public selectionClients!: Array<string>
//   @selections.Getter public selectionProducts!: Array<string>
//   @selections.Mutation public delFromSelectionDepots!: (s: string) => void
//   @selections.Mutation public delFromSelectionClients!: (s: string) => void
//   @selections.Mutation public delFromSelectionProducts!: (s: string) => void
//   @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
//   @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
//   @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
// }
</script>
<style>
.quickselection .el-tabs__content{
  min-height: 30vh !important;
  overflow-y: auto;
}
</style>
