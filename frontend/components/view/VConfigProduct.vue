<template>
  <h5>{{  $t('title.properties') }}</h5>
  <h6>Id: {{ props.id }}</h6>
  <h7>Version: {{ getVersion(fetchedData.properties, fetchedData.properties.productVersions || fetchedData.dependencies.productVersions) }}</h7> <br />
  <!-- TODO: render description and advice as markdown -->
  <b>{{ $t('table.fields.description'): }}</b><pre><Markdown> {{ fetchedData.properties.productDescription || fetchedData.dependencies.productDescription }} </Markdown></pre>
  <b>{{ $t('table.fields.advice') }}:</b><pre><Markdown> {{ fetchedData.properties.productAdvice || fetchedData.dependencies.productAdvice }} </Markdown></pre>

  <el-alert v-if="selectionClients.length <= 0" :title="$t('message.warning.noClientsSelectedShowDepot')" type="warning" />
  <el-alert v-if="Object.values(fetchedData.properties.productVersions).filter(n => n).length !== selectionDepots.length" :title="$t('message.warning.notOnEachDepot', {count:Object.values(fetchedData.properties.productVersions).filter(n => n).length, countall:selectionDepots.length})" type="warning" />
  <el-alert v-if="Object.values(fetchedData.properties.productVersions).filter(n => n).some((v)=>v!=Object.values(fetchedData.properties.productVersions).filter(n => n)[0])" :title="$t('message.warning.differentProductVersions')" type="warning" />

  <IconILoading v-if="isLoading"  />
  <el-tabs v-else v-model="activeName" class="demo-tabs">
    <el-tab-pane
      :label="$t('title.prodproperties')"
      name="properties"
      active
    >

      <ViewVConfigProductProperty
        :properties="fetchedData.properties"
        @change-property="changeProperty"
        />
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
import { useSaveProductProperties } from '~/composables/mixins/useSave';
import { useUtils } from '~/composables/mixins/useUtils';
import type { T_ProductPropertiesResult, T_ProductDependenciesResult, T_ProductPropertiesDependenciesResult } from '~/types/APItypes';
import type { IErrorDepProp, IFetchedData } from '~/types/tobjects';
const $t = useI18n().t
const isLoading = ref(true)
const changes = storeChanges()
const settings = storeSettings()
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



const fetchedData = ref<T_ProductPropertiesDependenciesResult>({
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
onMounted(async ()=>{
  if (props.isChild) await fetch()
  // otherwise fetch already called
})

async function fetch(){
  isLoading.value = true
  fetchedData.value = {
      dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {}, productAdvice: '', productAdviceDetails: {} },
      properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {}, productAdvice: '', productAdviceDetails: {} }
    }
  errorText.value = { dependencies: '', properties: '' }

  await fetchProperties()
  await fetchDependencies()
  isLoading.value = false
}
async function fetchProperties (refetch: boolean = false) {
  const { data, error } = await useApiGETBody<T_ProductPropertiesResult>(`/opsidata/products/${props.id}/properties`, {
    selectedDepots: `[${selectionDepots.value.toString()}]`,
    selectedClients: `[${selectionClients.value.toString()}]`
  })

  if (error) {
    console.log(error)
    useNotification().error(error)
    errorText.value.properties = error.response.data.message
    return
  }
  fetchedData.value.properties = data.value
}
async function fetchDependencies () {
  const { data, error } = await useApiGETBody<T_ProductDependenciesResult>(`/opsidata/products/${props.id}/dependencies`, {
    selectedDepots: `[${selectionDepots.value.toString()}]`,
    selectedClients: `[${selectionClients.value.toString()}]`
  })

  if (error) {
    console.log(error)
    useNotification().error(error)
    errorText.value.dependencies = error.response.data.message
    return
  }
  fetchedData.value.dependencies = data.value
}

async function changeProperty (item: any, values: any, originValue: any) {
  if (!settings.quicksave) {
    if (selectionClients.value.length > 0) {
        handleTrackingChanges(item.productId, selectionClients.value, 'clientId', item.propertyId, values, originValue)
      } else {
        handleTrackingChanges(item.productId, selectionDepots.value, 'depotId', item.propertyId, values, originValue)
      }
    return
  }
  const data: any = {
    properties: { [item.propertyId]: values },
    // depotIds: undefined,
    // clientIds: undefined
  }
  if (selectionClients.value.length > 0) {
    data.clientIds = [...selectionClients.value]
  } else {
    data.depotIds = [...selectionDepots.value]
  }

  console.log('changeProperty ', item.productId, item.propertyId)
  console.log('changeProperty new value', values)
  console.log('changeProperty old value', originValue)
  console.log('changeProperty params', data)
  if (originValue === values) {
    console.log('originValue === values', originValue, values)
    return
  }
  else if (values === '' && originValue === undefined) {
    console.log('values === "" && originValue === undefined', originValue, values)
    return
  }
  await useSaveProductProperties().saveProdProperties(item.productId, data as Object, false, true)


function handleTrackingChanges (productId:string, hosts:Array<string>, key:string, propertyId:string, value: any, orgValue: any) {
    for (const h in hosts) {
      const changeObject: Object = {
        user: storeAuth().username,
        // user: localStorage.getItem('username'),
        [key]: hosts[h],
        productId: productId,
        property: propertyId,
        propertyValue: value
      }
      const objIndex = changes.changesProducts.findIndex((item:any) => item[key] === hosts[h] && item.productId === productId && item.property === propertyId)
      if (objIndex > -1) {
        changes.delWithIndexChangesProducts(objIndex)
      }
      // if (!arrayEqual(value, orgValues)) {
        console.log('CHANGESprops pushToChangesProducts value', value)
        console.log('CHANGESprops pushToChangesProducts orgValue', orgValue)
        console.log('CHANGESprops pushToChangesProducts if unequal', changeObject)
        if (value !== orgValue) {
          console.log('CHANGESprops pushToChangesProducts push', changeObject)
          changes.pushToChangesProducts(changeObject)
        }
      }
    }
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