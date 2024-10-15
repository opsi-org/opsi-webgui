<template>
  <el-form label-width="70px" label-position="top" size="small">
    <el-form-item v-for="category in selectionDisplayList" :key="category" class="flex items-stretch">
      <template #label>
        <div class="!d-inline">
        <b class="pr-2"> {{ $t('title.' + category.toLowerCase()) }} </b>
        <el-button
          size="small"
          class="border-0 !p-1 m-auto !d-inline"
          :title="$t('tree.selection.clear.all')"
          :disable="storeSelection['selection' + category].length <= 0">
          <span class="sr-only">{{ $t('button.deselect') }}</span>
          <IconIIcon
            :icon="icons.x"
            @click="storeSelection['clearSelection' + category]"
          />
        </el-button>
        </div>
      </template>
      <el-scrollbar max-height="250px" class="w-full flex items-stretch ml-3">
        <ul direction="vertical">
          <li
            v-for="item in storeSelection['selection' + category]"
            :key="item"
            class="relative flex items-stretch "
          >
            <p class="pr-8">{{ item }}</p>
            <el-button
              size="small"
              class="border-0 !p-1 absolute top-0 right-0"
              :title="$t('tree.selection.clear.one', {id: item})"
              >
              <span class="sr-only">{{ $t('button.deselect') }}</span>
              <IconIIcon
                :icon="icons.x"
                @click="storeSelection['delFromSelection' + category](item)"
              />
            </el-button>
          </li>
        </ul>
      </el-scrollbar>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  import type { IObjectString2Any } from '~/types/tgeneral';
import { useIcons } from '../../composables/mixins/useIcons'
  const $t = useI18n().t
  const icons = useIcons()
  const storeSelection: IObjectString2Any = storeSelections()
  const selectionDisplayList = ref<Array<string>>([
    'Depots',
    'Clients',
    'Products',
  ])
</script>
