<template>
  <el-form label-width="70px" label-position="left" size="small">
    <el-form-item v-for="category in selectionDisplayList">
      <template #label>
        {{ $t('title.' + category.toLowerCase()) }}
        <el-button size="small" class="border-0 p-0 ml-auto">
          <span class="sr-only">{{ $t('button.deselect') }}</span>
          <IconIIcon
            :icon="icons.x"
            @click="storeSelection['clearSelection' + category]"
          />
        </el-button>
      </template>
      <el-scrollbar max-height="250px">
        <ul direction="vertical">
          <li
            v-for="item in storeSelection['selection' + category]"
            :key="item"
          >
            {{ item }}
            <el-button size="small" class="border-0 float-right">
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
  import { useIcons } from '../../composables/mixins/useIcons'
  const icons = useIcons()
  const storeSelection = storeSelections()
  const selectionDisplayList = ref<Array<any>>([
    'Depots',
    'Clients',
    'Products',
  ])
</script>
