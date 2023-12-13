<script setup lang="ts">
import { loginlogout } from '~/histoire/histoire-utils'
import { useConfigserver } from '~/composables/mixins/useGet'

async function init(data: any) {
  await loginlogout(data)
  const selection = await useConfigserver().getOpsiConfigServer()
  if (selection){
    console.log('opsiserver', selection)
    storeSelections().pushToSelectionDepots(selection)
  } else {
    console.log('could find opsiserver')
  }
  // const store = storeCache().opsiconfigserver
  // console.log('inside store', store)
  const store = storeSelections().selectionDepots
  console.log('inside store', store)
}
const selectedServer = ref('')
function changeId (id:string) {
  selectedServer.value = id
}
</script>
<template>
  <Story :setup-app="init">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <LayoutLPageContent :is-mobile="true">
        <template #default>
          <ViewVServer :is-mobile="true" @change="changeId"/>
        </template>
        <template #page1>
          <ViewVConfig :is-mobile="true" :is-child="true" :id="selectedServer" type="depots"/>
        </template>
      </LayoutLPageContent>
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <LayoutLPageContent :is-mobile="false">
        <template #default>
          <ViewVServer :is-mobile="false" @change="changeId"/>
        </template>
        <template #page1>
          <ViewVConfig :is-mobile="false" :is-child="true" :id="selectedServer" type="depots"/>
        </template>
      </LayoutLPageContent>
    </Variant>
  </Story>
</template>