<template>
  <div>
    <el-button class="float-right" @click="useRouter().push('/servers/')">X</el-button>
    <ViewVConfig v-if="splitType === 'config'" :type="type" :id="id" :is-child="id !== undefined && id !== ''"/>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const type = 'depots'
const id = ref<string>()
const splitType = ref<string>()
onMounted(()=>{
  setIdFromParam()
  setSplitTypeFromParam()
})

watch(()=>route.params.id, ()=>{
  setIdFromParam()
  setSplitTypeFromParam()
}, {deep: true})

function setIdFromParam() {
  // id.value = route.params.id
  const routeLength = route.params.id?.length || 1
  const _id = route.params.id?.[routeLength - 1] || ''
  if (!['config', 'log', 'products'].includes(_id)) {
    id.value = _id
  }
  console.log('route.params.id id', route.params.id, id.value)
}
function setSplitTypeFromParam() {
  // id.value = route.params.id
  const _id = route.params.id?.[0] || ''
  splitType.value = _id
  console.log('route.params.id split', route.params.id, splitType.value)
}
</script>