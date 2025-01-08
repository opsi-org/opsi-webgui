<template>
  <el-form
    label-position="top"
    size="small"
    data-testid="FAllSelections"
    class="rounded-lg shadow-md pb-1"
  >
    <el-form-item
      v-for="category in selectionDisplayList"
      :key="category"
      class="flex items-stretch"
    >
      <template #label>
        <div class="!d-inline">
          <b class="pr-2"> {{ $t('title.' + category.toLowerCase()) }} </b>
          <el-button
            v-if="storeSelection['selection' + category].length > 1"
            size="small"
            class="!border-none !p-1 m-auto !d-inline"
            :title="$t('tree.selection.clear.all')"
            :disable="storeSelection['selection' + category].length <= 0"
          >
            <span class="sr-only">{{ $t('button.deselect') }}</span>
            <IconIIcon
              :icon="icons.x"
              @click="storeSelection['clearSelection' + category]"
            />
          </el-button>
        </div>
      </template>
      <el-scrollbar max-height="200px" class="w-full items-stretch flex ml-3">
        <el-alert
          v-if="storeSelection['selection' + category].length <= 0"
          type="info"
          size="small"
          show-icon
          :closable="false"
          >{{ $t('info.noselection') }}</el-alert
        >
        <ul v-else direction="vertical">
          <li
            v-for="item in storeSelection['selection' + category]"
            :key="item"
            class="relative flex items-stretch"
          >
            <p class="pr-8">{{ item }}</p>
            <el-button
              size="small"
              class="!border-none !p-1 absolute top-0 right-0"
              :title="$t('tree.selection.clear.one', { id: item })"
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
  import type { IObjectString2Any } from '~/types/tgeneral'
  const $t = useI18n().t
  const icons = useIcons()
  const storeSelection: IObjectString2Any = storeSelections()
  const selectionDisplayList = ref<Array<string>>([
    'Depots', // for translation key search $t('title.depots')
    'Clients', // $t('title.clients')
    'Products', // $t('title.products')
  ])
</script>
