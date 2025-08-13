<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <p-panel :header="$t('unsavedChanges')">
    <el-table :data="bufferedChanges" :span-method="spanClients">
      <el-table-column :label="$t('clients')" prop="client">
        <template #default="scope">
          <div v-if="scope.$index === 0">
            <PanelPList
              :data="storeSelection.selectionClients"
              @delete="storeSelection['delFromSelectionClients']"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="productIds" :label="$t('products')">
        <template #default="scope">
          <ul>
            <li v-for="product in scope.row.productIds" :key="product">
              {{ product }}
            </li>
          </ul>
        </template>
      </el-table-column>
      <el-table-column
        prop="actionRequest"
        width="100px"
        :label="$t('actionRequest')"
      ></el-table-column>
      <el-table-column width="50px" label="">
        <template #default="scope">
          <p-button
            v-if="hasEmitDeleteOne"
            icon="pi pi-trash"
            class="p-button-rounded p-button-text"
            @click="emit('deleteOne', scope.row)"
            :aria-label="$t('delete')"
          />
        </template>
      </el-table-column>
    </el-table>
    <template v-if="props.withFooter">
      <div class="dialog-footer flex justify-end">
        <el-button v-if="hasEmitDiscard" type="danger" @click="emit('discard')">{{
          $t('discardAll')
        }}</el-button>

        <el-button
          :type="hasUnsavedChanges ? 'success' : ''"
          class="right"
          :disabled="!hasUnsavedChanges"
          @click="emit('save')"
        >
          {{ $t('save') }}
        </el-button>
      </div>
    </template>
  </p-panel>
</template>

<script setup lang="ts">
  const thisInstance = getCurrentInstance()
  const storeSelection = storeSelections()
  const icons = useIcons()
  const emit = defineEmits(['save', 'discard', 'deleteOne'])
  const props = defineProps({
    withFooter: {
      type: Boolean,
      default: true,
    },
    bufferedChanges: {
      type: Array as PropType<
        Array<{
          client: string
          productIds: string[]
          actionRequest: string
          oldActionRequest: string
        }>
      >,
      required: true,
    },
  })
  const hasUnsavedChanges = computed(() => props.bufferedChanges?.length > 0)
  const hasEmitDiscard = thisInstance?.vnode?.props?.onDiscard !== undefined
  const hasEmitDeleteOne = thisInstance?.vnode?.props?.onDeleteOne !== undefined

  function spanClients({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }) {
    // Merge the first column (Clients) vertically for all rows
    if (columnIndex === 0) {
      if (rowIndex === 0) {
        return [props.bufferedChanges.length, 1]
      } else {
        return [0, 0]
      }
    }
  }
</script>
<style scoped lang="css">
  :deep(.p-panel-content) {
    padding: 0;
  }
</style>
