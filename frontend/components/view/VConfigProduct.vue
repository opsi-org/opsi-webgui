<template>
  <h5>{{  $t('title.properties') }}</h5>
  <h6>Id: {{ props.id }}</h6>
  <h7>Version: {{ fetchedData.properties.productVersions || fetchedData.dependencies.productVersions }}</h7> <br />
  <!-- TODO: render description and advice as markdown -->
  <b>Description: {{ fetchedData.properties.productDescription || fetchedData.dependencies.productDescription }}</b> <br />
  <b>Advice: {{ fetchedData.properties.productAdvice || fetchedData.dependencies.productAdvice }}</b> <br />

  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane
      :label="$t('title.prodproperties')"
      name="properties"
      active
    >
      <ViewVConfigProductProperty :properties="fetchedData.properties" />
      {{errorText.properties}}
      </el-tab-pane>
    <el-tab-pane :label="$t('title.dependencies') + ' ' + (fetchedData.dependencies.dependencies?.length > 0 ? '': $t('title.dependenciesEmpty'))" name="dependencies"
      :disabled="fetchedData.dependencies.dependencies?.length <= 0">
      <ViewVConfigProductDependencies :dependencies="fetchedData.dependencies" />
    <!-- <FormrowFRItemsText /> -->
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
    dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {}, productAdvice: '', productAdviceDetails: {} },
    properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {}, productAdvice: '', productAdviceDetails: {} }
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
      dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {}, productAdvice: '', productAdviceDetails: {} },
      properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {}, productAdvice: '', productAdviceDetails: {} }
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