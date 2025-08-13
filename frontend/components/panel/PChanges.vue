<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <p-panel :header="$t('unsavedChanges')">
    <el-table :data="changesProductsFlat">
      <el-table-column :label="$t('clients')" prop="client">
        <template #default="scope">
          <ul>
            <li v-for="client in scope.row.clientIds" :key="client">
              {{ client }}
            </li>
          </ul>
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
          <ButtonBTNDelete @delete="emit('deleteOne', scope.row)" class="justify-end" />
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
        <el-button
          v-if="hasEmitDiscard"
          type="danger"
          @click="emit('discard')"
          :disabled="!changesProductsExists"
          >{{ $t('discardAll') }}</el-button
        >

        <el-button
          :type="changesProductsExists ? 'success' : ''"
          class="right"
          :disabled="!changesProductsExists"
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
  const emit = defineEmits(['save', 'discard', 'deleteOne'])
  const props = defineProps({
    withFooter: {
      type: Boolean,
      default: true,
    },
  })
  const { changesProductsExists, changesProductsFlat } = storeToRefs(storeChanges())
  const hasEmitDiscard = thisInstance?.vnode?.props?.onDiscard !== undefined
  const hasEmitDeleteOne = thisInstance?.vnode?.props?.onDeleteOne !== undefined
</script>
<style scoped lang="css">
  :deep(.p-panel-content) {
    padding: 0;
  }
</style>
