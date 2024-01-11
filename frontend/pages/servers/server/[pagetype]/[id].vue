<template>
  <div>
    <div v-if="pagetype === 'config'">
      <el-button class="float-right" @click="useRouter().push(`/${type}/`)">X</el-button>
      <ViewVConfig  :type="type" :id="id" :is-child="id !== undefined && id !== ''"/>
    </div>
    <div v-else-if="pagetype === 'logs'">
      <div> LOGS </div>
    </div>
    <!-- <div v-else-if="pagetype === 'clone'">
      <div> LOGS </div>
    </div> -->
    <div v-else>
      idk
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageHelper } from '~/composables/mixins/usePageHelper'
const route = useRoute()
const type = computed(()=> usePageHelper().path.value[0])
const id = computed(()=>route.params.id as string)
const pagetype = computed(()=>route.params.pagetype as string)

</script>