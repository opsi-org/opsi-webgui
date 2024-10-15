<template>
  <div>
    <el-text tag="b" class="text-capitalize"> {{ pagetype }}</el-text> - <el-text tag="i"> {{ id }} </el-text>
    <el-button class="float-right" @click="router.push(`/${type}/`)">X</el-button>
    <ViewVConfig v-if="pagetype === 'config'" :type="type" :id="id" :is-child="id !== undefined && id !== ''"/>
    <div v-else> Page not found! </div>
  </div>
</template>

<script setup lang="ts">
import { usePageHelper } from '~/composables/mixins/usePageHelper'
const route = useRoute()
const router = useRouter()
const type = computed<string>(()=> usePageHelper().path.value[0])
const id = computed<string>(()=>route.params.id as string)
const pagetype = computed<string>(()=>route.params.pagetype as string)

</script>