
<template>
  <el-table :data="fetchedData" v-loading="isLoading" @sort-change="$emit('handleSortChange')">
        <template v-for="column in tableColumn">
          <el-table-column
            v-if="column.visible || column.alwaysVisible"
            :key="column.key"
            :prop="column.key"
            :label="column.title"
            :type="column.type"
            :sortable="column.sortable"
          >
            <template #default="scope" v-if="column.key === 'actions'">
              <div v-contextmenu="(event: MouseEvent) => $emit('showContextMenu',{event, row:scope.row})">
                <el-tooltip :content="$t('title.config')" placement="top">
                  <el-button
                    type="text"
                    @click="$emit('handleConfigClick', scope.row)"
                    :class="{ 'is-active': activeButton === 'config-' + scope.row.clientId }"
                  >
                    <IconIIcon :icon="icons.settings" />
                  </el-button>
                </el-tooltip>
                <el-tooltip :content="$t('title.log')" placement="top">
                  <el-button
                    type="text"
                    @click="$emit('handleLogClick', scope.row)"
                    :class="{ 'is-active': activeButton === 'log-' + scope.row.clientId }"
                  >
                    <IconIIcon :icon="icons.log" />
                  </el-button>
                </el-tooltip>
                <el-tooltip :content="$t('title.clone')" placement="top">
                  <el-button
                    type="text"
                    @click="$emit('handleCloneClick', scope.row)"
                    :class="{ 'is-active': activeButton === 'clone-' + scope.row.clientId }"
                  >
                    <IconIIcon :icon="icons.client" />
                  </el-button>
                </el-tooltip>
                <DropdownDDClientActions :client-ids="[scope.row.clientId]" />
              </div>
            </template>
          </el-table-column>
        </template>
      </el-table>
</template>

<script setup lang="ts">
import {useIcons} from '../../composables/mixins/useIcons'

const $t = useI18n().t
const icons = useIcons()
const fetchedData = defineModel<Array<any>>('data', { required:true})
const activeButton = defineModel<string|null>('activeButton')
// const isLoading = defineModel<string>('isLoading', { required:true})

const _props = defineProps({
  // columns: { type: Object as PropType<ITableHeaderRow>, required:true},
    isLoading: { type: Boolean, required: true },
    tableColumn: { type: Array<any>, required: true },
})
const $emit = defineEmits(['handleSortChange', 'handleCloneClick', 'handleLogClick', 'handleConfigClick', 'showContextMenu'])
</script>
