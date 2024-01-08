<template>
  <h5>{{  $t('title.properties') }}</h5>
  <h6>Id: {{ props.id }}</h6>
  <h7>Version: {{ getVersion(fetchedData.properties, fetchedData.properties.productVersions || fetchedData.dependencies.productVersions) }}</h7> <br />
  <!-- TODO: render description and advice as markdown -->
  <b>Description: {{ fetchedData.properties.productDescription || fetchedData.dependencies.productDescription }}</b> <br />
  <b>Advice: {{ fetchedData.properties.productAdvice || fetchedData.dependencies.productAdvice }}</b> <br />


  <el-alert v-if="selectionClients.length <= 0" :title="$t('message.warning.noClientsSelectedShowDepot')" type="warning" />
    <el-alert v-if="Object.values(fetchedData.properties.productVersions).filter(n => n).length !== selectionDepots.length" :title="$t('message.warning.notOnEachDepot', {count:Object.values(fetchedData.properties.productVersions).filter(n => n).length, countall:selectionDepots.length})" type="warning" />
    <el-alert v-if="Object.values(fetchedData.properties.productVersions).filter(n => n).some((v)=>v!=Object.values(fetchedData.properties.productVersions).filter(n => n)[0])" :title="$t('message.warning.differentProductVersions')" type="warning" />
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
import { useUtils } from '~/composables/mixins/useUtils';
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


function getVersion (item: any, versions: any) {
  const hasVersionValue = Object.keys(versions).length > 0
  const allVersionEqual = useUtils().isEqual(Object.values(versions))
  if (allVersionEqual && hasVersionValue) {
    return Object.values(versions)[0]
  } else if (hasVersionValue) {
    return 'mixed'
  }
  return 'undefined'
}
</script>