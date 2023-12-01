<template>
  <el-select v-model="value" clearable placeholder="Select a Server">
    <el-option
      v-for="item in fetchedData"
      :key="item"
      :label="item"
      :value="item"
    />
  </el-select>
</template>

<script setup lang="tsx">
import { useNotification } from '~/composables/mixins/useComponent';
import { useDepot } from '~/composables/mixins/useGet';
const $t = useI18n().t
let fetchedData = ref<Array<any>>([])
const value = ref('')

onMounted(async ()=> await fetch())

async function fetch() {
  const {data, error} = await useDepot().getDepotIdList()
  fetchedData = data
}
</script>
