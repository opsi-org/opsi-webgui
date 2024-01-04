<template>
  <h5>{{  $t('title.properties') }}</h5>
  <h6>Id: {{ props.id }}</h6>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane
      :label="$t('title.prodproperties')"
      name="properties"
      active
      >
      <!-- :disabled="!(type == 'clients' || type == 'depots')" -->
        <!-- <FormFHostParameter v-if="activeName==='config'" :id="id" :type="type"/> -->
        <h6>Properties</h6>
        <pre>{{ fetchedData.properties }}</pre>

        {{errorText.properties}}
      </el-tab-pane>
    <el-tab-pane :label="$t('title.dependencies')" name="dependencies"
    >
    <!-- :disabled="isIdEmpty" -->
    <h6>Dependencies</h6>
    <pre>{{ fetchedData.dependencies }}</pre>
      <!-- <el-scrollbar >
        <FormFHostAttributes :id="id" :type="type"/>
      </el-scrollbar> -->
      {{ errorText.dependencies  }}
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import type { IErrorDepProp, IFetchedData } from '~/types/tobjects';

const tableSettings = storeTablesettings()
const { configLastSelected } = storeToRefs(tableSettings)

const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'product' },
  isChild: { type: Boolean, default: true }
})

const errorText = ref<IErrorDepProp>({ dependencies: '', properties: '' })
const activeName = ref(props.isChild ? configLastSelected.value[props.type] || 'properties' : 'properties')

watch(()=> activeName.value, (val)=>{
  if (props.isChild){
    tableSettings.setConfigLastSelected(props.type, activeName.value)
  }
})


const fetchedData = ref<IFetchedData>({
    dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {} },
    properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {} }
  })

const dataSelection = storeSelections()
const { selectionDepots, selectionClients, selectionProducts } = storeToRefs(dataSelection)
watch(()=>selectionDepots.value, async ()=>{
  await fetch()
})
watch(()=>selectionClients.value, async ()=>{
  await fetch()
})
watch(()=>props.id, async ()=>{
  console.log('PROPERTIES props.id', props.id)
  await fetch()
})

async function fetch(){
  fetchedData.value = {
      dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {} },
      properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {} }
    }
  errorText.value = { dependencies: '', properties: '' }

  await fetchProperties()
  await fetchDependencies()
}
async function fetchProperties (refetch: boolean = false) {
  const { data, error } = await useApiGETBody(`/opsidata/products/${props.id}/properties`, {
    selectedDepots: `[${selectionDepots.value.toString()}]`,
    selectedClients: `[${selectionClients.value.toString()}]`
  })

  if (error) {
    console.log(error)
    useNotification().error(error)
    errorText.value.properties = error
    return
  }
  fetchedData.value.properties = data.value
}
async function fetchDependencies () {
  const { data, error } = await useApiGETBody(`/opsidata/products/${props.id}/dependencies`, {
    selectedDepots: `[${selectionDepots.value.toString()}]`,
    selectedClients: `[${selectionClients.value.toString()}]`
  })

  if (error) {
    console.log(error)
    useNotification().error(error)
    errorText.value.dependencies = error
    return
  }
  fetchedData.value.dependencies = data.value
}
</script>