<template>
  <el-form label-width="70px" label-position="left" size="small">
    <el-form-item v-for="category in selectionDisplayList">
      <template #label>
        {{ $t('title.'+category.toLowerCase()) }}
        <el-button size="small">
          <span class="sr-only">{{ $t('button.deselect') }}</span>
          <IconIIcon :icon="icons.x"  @click="storeSelection['clearSelection'+category]" />
        </el-button>
      </template>
      <ul direction="vertical">
        <li v-for="item in storeSelection['selection'+category]" :key="item">
          {{ item }}
          <el-button size="small">
            <span class="sr-only">{{ $t('button.deselect') }}</span>
            <IconIIcon :icon="icons.x" @click="storeSelection['delFromSelection'+category]" />
          </el-button>
        </li>
      </ul>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const storeSelection = storeSelections()
const selectionDisplayList = ref<Array<any>>(['Depots', 'Clients', 'Products'])
</script>
